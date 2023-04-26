/**
 * This module contains functions that filter, transform, combine or otherwise wrangle the spreadsheet data into submission.
 */

import * as Api from "./api.js"

export function getOfficerList() {
    if (!Api.initialized) {
        return [];
    }
    return Api.officers;
}

export function getShipByName(name) {
    if (!Api.initialized) {
        console.log("API not ready")
        return undefined;
    }

    let ship = Api.ships.find(elem => elem.name == name);
    ship.assigned_officers = getOfficersForShip(ship);
    return ship;
}

export function getOfficerRecordByName(name) {
    if (!Api.initialized) {
        console.log("API not ready")
        return undefined;
    }

    let officer = Api.officers.find(elem => elem.name == name);
    officer.awards = getAwardsForOfficer(officer);
    return officer;
}

function getOfficersForShip(shipRecord) {
    return Api.officers.filter(elem => elem.current_assignment == shipRecord.name);
}

function getAwardsForOfficer(officerRecord) {
    let awards = Api.awardsRecords.filter(elem => elem.officer == officerRecord.name)
    awards = awards.map(award => {
        let awardData = Api.awards.find(aw => aw.title == award.award);
        let newRecord = {};
        if (awardData) {
            Object.keys(award).forEach(k => newRecord[k] = award[k])
            Object.keys(awardData).forEach(k => newRecord[k] = awardData[k])
        }
        return newRecord;
    })
    awards = awards.filter(aw => Object.keys(aw).length !== 0);
    return awards;
}