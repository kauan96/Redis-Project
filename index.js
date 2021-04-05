const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

let memory = [];
let level = 0;
let index = null;
ask = (questionText) => {
  return new Promise((resolve) => {
    readlineInterface.question(questionText, resolve);
  });
}

getCommand = (text) => {
    return text.substr(0, text.indexOf(' ')).toUpperCase();
}

getCurrentVar = (text, command) => {
    return (text.split(" ").length - 1) > 1 
            ? text.substr(command.length + 1, text.slice(command.length + 1).indexOf(' '))
                .replace(' ', '').toLowerCase()
            : text.substr(command.length + 1, text.length).toLowerCase();
}

getCurrentValue = (text) => {
    return text.substr(text.lastIndexOf(' '), text.length).replace(' ', '');
}

getIndex = (array,value) => {
    let arrayCopy = [...array]
    return arrayCopy.reverse().findIndex(item => item.name == value && item.level == level);
}

existingItem = (arrayAux, name) => {
    return (!arrayAux.length) || (arrayAux.length && arrayAux.every(item => item.name != name))
}

showError = (message) => {
    console.log(message.toString())
}

begin = () => {
    let duplicateArray = JSON.parse(JSON.stringify(memory.filter(item => item.level == level)));
    level++;
    duplicateArray.forEach(item => item.level = level)
    memory = memory.concat(duplicateArray);
}

commit = () => {
    let arrayAux = [];
    memory.forEach(slot => {
        if (existingItem(arrayAux, slot.name)) {
            slot.level = 0;
            arrayAux.push(slot)
        } else {
            let indexAux = arrayAux.findIndex(item => item.name == slot.name);
            if (arrayAux[indexAux].level <= slot.level) {
                arrayAux.pop(indexAux);
                slot.level = 0;
                arrayAux.push(slot);
            }
        }
    });
    level = 0;
    memory = arrayAux;
}

setData = (currentVar, currentValue) => {
    let existingSlot = memory.findIndex(item => item.name == currentVar && item.level == level);
    if (existingSlot > -1) memory[existingSlot].value = currentValue;
    else {
        memory.push({
            name: currentVar,
            value: currentValue,
            level
        });
    }
}

start();

callTransactions = (text) => {
    let command = text.substr(0, text.length).toUpperCase();
    switch (command) {
        case 'BEGIN':
            begin()
            break;
        case 'COMMIT':
            if (memory.length) commit()
            else showError('NO TRANSACTION');
            break;
        case 'ROLLBACK':
            if (memory.length && memory.some(item => item.level != 0)) {
                memory = memory.filter(item => item.level != level);
                level--;
            } else showError('NO TRANSACTION');
            break;
        case 'END':
            process.exit();
            break;
        default:
            showError('Write a valid command!');
    }
}

callDataCommands = (text) => {
    let command = getCommand(text);
    let currentVar = getCurrentVar(text, command);
    let currentValue = getCurrentValue(text);

    switch (command) {
        case 'SET':
            setData(currentVar, currentValue)
            break;
        case 'GET':
            index = getIndex(memory, currentVar);
            if (index > -1) console.log(memory.reverse()[index].value);
            else showError('NULL');
            break;
        case 'NUMEQUALTO':
            if (memory.length) 
                console.log(memory.filter(slot => slot.value == currentVar 
                                        && slot.level == level).length);
            else showError('0');
            break;
        case 'UNSET':
            index = getIndex(memory, currentVar);
            if (index > -1) memory.pop(index);
            else showError('NULL');
            break;
        default:
    }
}

async function start() {
    const text = await ask('');
    
    if(text.match(' ') && text.match(' ').length > 0) {
        callDataCommands(text)
    } else {
        callTransactions(text)
    }
    start();
}