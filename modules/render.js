/**
 * This file contains functions that take the data and actually put it into the DOM (displaying it).
 * 
 */

import * as Data from "./data.js"

export function renderOfficerList() {
    let officers = Data.getOfficerList();
    let me = mainElement();
    me.innerHTML = "";

    officers.forEach(officer => {
        let a = document.createElement("a");
        a.addEventListener('click', e => renderOfficer(officer.name));
        a.text = officer.name;
        a.class = "link officer"
        me.appendChild(a)
    })

}

function renderOfficer(name) {
    console.log(name);
}

function mainElement() {
    return document.getElementById("main");
}