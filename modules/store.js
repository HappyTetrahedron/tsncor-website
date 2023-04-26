/**
 * This module contains functions that filter, transform, combine or otherwise wrangle the spreadsheet data into submission.
 */

import * as Api from "./api.js"
import {reactive} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

export const store = reactive({
    officers: [],
    ships: [],
    awards: [],
    awardsRecords: [],
    ranks: [],

    officerSearch: "",
    showInactive: false,

    selectedOfficer: "",
    selectedShip: "",

    get filteredOfficers() {
        let ol = this.officers
            .filter(o => o.name.toLowerCase().includes(this.officerSearch.toLowerCase()));
        if (!this.showInactive) {
            ol = ol.filter(o => ["Active", "Casual"].includes(o.current_status));
        }
       return ol.sort(this.compareOfficers.bind(this)).reverse();
    },

    get selectedOfficerObject() {
        return this.getOfficerRecordByName(this.selectedOfficer)
    },

    get selectedShipObject() {
        return this.getShipByName(this.selectedShip);
    },

    get sortedRanks() {
        return this.ranks.sort((a, b) => (a.pay_grade > b.pay_grade) ? 1 : (a.pay_grade === b.pay_grade) ? 0 : -1)
    },

    updateOfficers(officers) {
        this.officers = officers;
    },
    updateShips(ships) {
        this.ships = ships;
    },
    updateAwards(awards) {
        this.awards = awards;
    },
    updateAwardsRecords(awardsRecords) {
        this.awardsRecords = awardsRecords;
    },
    updateRanks(ranks) {
        this.ranks = ranks;
    },


    selectOfficer(officerName) {
        this.selectedOfficer = officerName;
    },

    selectShip(shipName) {
        this.selectedShip = shipName;
    },

    getOfficerRecordByName(name) {
        let officer = this.officers.find(elem => elem.name == name);
        if (officer === undefined) {
            return undefined
        }
        officer.awards = this.getAwardsForOfficer(name);
        return officer;
    },

    getAwardsForOfficer(officerName) {
        let records = this.awardsRecords.filter(elem => elem.officer == officerName)
        records = records.map(award => {
            let awardData = this.awards.find(aw => aw.title == award.award);
            let newRecord = {};
            if (awardData) {
                Object.keys(award).forEach(k => newRecord[k] = award[k])
                Object.keys(awardData).forEach(k => newRecord[k] = awardData[k])
            }
            return newRecord;
        })
        records = records.filter(aw => Object.keys(aw).length !== 0);
        return records;
    },

    getShipByName(name) {
        let ship = this.ships.find(elem => elem.name == name);
        if (ship === undefined) {
            return undefined
        }
        ship.assigned_officers = this.getOfficersForShip(name);
        return ship;
    },

    getOfficersForShip(shipName) {
        return this.officers.filter(elem => elem.current_assignment == shipName);
    },

    formatDate(dateString) {
        var date = new Date(dateString);
        if (isNaN(date)) {
            return dateString;
        }
        return date.getDate()+1+ "/" + (date.getMonth()+1)+ "/" +(date.getFullYear()-2000);
    },

    /**
     * 
     * @param {officer} a 
     * @param {officer} b 
     * @returns -1 if a is less senior than b. 1 if a is more senior than b. 0 if a and b have the same seniority.
     */
    compareOfficers(a, b) {
        let rankA = this.ranks.find(r => r.name === a.rank)?.pay_grade ?? -1;
        let rankB = this.ranks.find(r => r.name === b.rank)?.pay_grade ?? -1;
        if (rankA < rankB) return -1;
        if (rankA > rankB) return 1;

        let senA = a.seniority
        let senB = b.seniority
        // seniority is a date. an *earlier* date means the officer is *more senior*.
        if (senA > senB) return -1;
        if (senA < senB) return 1;
        return 0;
    },

    init() {
        // This will run them all in parallel, which is faster.
        Promise.all([
            Api.fetchOfficerData().then(o => this.updateOfficers(o)),
            Api.fetchShipData().then(s => this.updateShips(s)),
            Api.fetchAwardData().then(a => this.updateAwards(a)), 
            Api.fetchAwardRecordData().then(a => this.updateAwardsRecords(a)), 
            Api.fetchRankData().then(r => this.updateRanks(r)), 
        ])
    }
})

