function openDiv(id){
    document.getElementById(id).style.display = "flex";
}

const display = document.getElementById("calcDisplay");

function appendToDisplay(char) {
    display.value += char;
}

function clearCalc() {
    display.value = "";
}

function calculate() {
    try {
        display.value = eval(display.value)
    } catch (err) {
        display.value = error;
    }
}