document.querySelectorAll('.drag').forEach(element => {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.addEventListener("mousedown", (e) => {
        e = e || window.event;
         if (!(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
            e.preventDefault();
        }
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    })
})

document.querySelectorAll(".closeDrag").forEach(ele => {
    ele.addEventListener("click", () => {
        ele.closest('.drag').style.display = "none";
    })
})

import { spline } from './main.js';
import { materials } from './main.js';




class theme {
    constructor(name, light, bright, dark) {
        this.name = name,
        this.light = light,
        this.bright = bright,
        this.dark = dark
    }
}

const addTheme = (div, theme, select = false) => {
    let sel = document.createElement("input")
    sel.type = "radio"
    sel.id = theme.name
    sel.name = "theme"
    sel.value = theme.name
    sel.checked = select;
    let label = document.createElement("label")
    label.htmlFor = theme.name
    label.textContent = theme.name
    div.appendChild(sel)
    div.appendChild(label)
    div.appendChild(document.createElement("br"))   
}

let PresetThemesDiv = document.getElementById("PresetThemes")

const PresetThemes = {
    Purple : new theme("Purple", "#c6aff4", "#2f175d", "#1c0c39"),
    Green : new theme("Green", "#aff4af", "#175d23", "#0c391e"),
    Blue : new theme("Blue", "#afc8f4", "#34349a", "#120a69")
}

let customThemes = {}
try {
        customThemes = JSON.parse(localStorage.getItem("themes")) || {};
} catch {
        localStorage.clear()
        customThemes = {};
}

if (customThemes) {
    for (const [name, theme] of Object.entries(customThemes)) {
        addTheme(document.getElementById("CustomThemes"), theme)
    }
}




for (const [name, theme] of Object.entries(PresetThemes)) {
    addTheme(PresetThemesDiv, theme)
}


const updateTheme = (theme) => {
    document.documentElement.style.setProperty("--light", theme.light)
    document.documentElement.style.setProperty("--bright", theme.bright)
    document.documentElement.style.setProperty("--dark", theme.dark)
}

const themesDiv = document.getElementById("themes");

themesDiv.addEventListener("change", e => {
    if (e.target.type === "radio") {
        if (e.target.value in PresetThemes) {
            updateTheme(PresetThemes[e.target.value])
        } else if (e.target.value in customThemes) {
            updateTheme(customThemes[e.target.value])
        }
    }
})


const themeCreator = document.getElementById("themeCreator")
themeCreator.addEventListener("change", e => {
    if (e.target.type === "color") {
        if (e.target.name === "main") {
            document.documentElement.style.setProperty("--light", e.target.value)
        } else if (e.target.name === "second") {
            document.documentElement.style.setProperty("--bright", e.target.value)
        } else {
            document.documentElement.style.setProperty("--dark", e.target.value)
        }
    }
})

const potionThemeCreator = document.getElementById("potionThemeCreator")
potionThemeCreator.addEventListener("change", e => {
    let name = e.target.name
    let value = e.target.value
    if (e.target.type === "color") {
        if (name === "outline") {
            materials.outline(value)
        } else if (name === "cork") {
            materials.cork(value)
        }
        if (name === "liquid1") {
            materials.liquid(value, 0)
        } else if (name === "liquid2") {
            materials.liquid(value, 1)
        }
        if (name === "background") {
            spline.setBackgroundColor(value)
        }
    }
})

themesDiv.querySelector("#add").addEventListener("click", () => {
    themeCreator.style.display = "block";
})

const checkDup = (key) => {
    let newKey = key
    let counter = 1;

    while (customThemes.hasOwnProperty(newKey)) {
        newKey = `${key}${counter}`
        counter ++;
    }

    return newKey
}

document.getElementById("saveTheme").addEventListener("click", () => {
    let name = themeCreator.querySelectorAll("input")[0].value
    if (name.trim) {
        let colors = [];
        themeCreator.querySelectorAll("input").forEach(ele => colors.push(ele.value))
        themeCreator.style.display = "none";
        colors[0] = checkDup(colors[0])
        createTheme(colors)
    }
})

const createTheme = (colors) => {
    let newTheme = new theme(colors[0], colors[1], colors[2], colors[3])
    customThemes[newTheme.name] = newTheme
    addTheme(document.getElementById("CustomThemes"), newTheme, true)
    localStorage.setItem("themes", JSON.stringify(customThemes))
}

