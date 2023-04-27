/**
 * This module contains a reactive store.
 * The store contains functions that expose, filter, transform, combine or otherwise wrangle the spreadsheet data into submission.
 * The store functions can be used in the website where the data is then displayed.
 * The advantage of using a reactive store: If the data changes, the website is updated automatically!
 * For this to work, data must always be modified through store functions. So, `store.updateOfficers(newValue)` instead of `store.officers = newValue`.
 */

import * as Api from "./api.js"
import * as Config from "../configuration.js"
import {reactive} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

export const store = reactive({
    officers: [],
    ships: [],
    awards: [],
    awardsRecords: [],
    ranks: [],
    awardImages: {},

    refreshing: false,

    officerSearch: "",
    showInactive: false,

    selectedOfficer: "",
    selectedShip: "",

    displayTab: "officers",

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
    updateAwardImages(awardImages) {
        this.awardImages = awardImages;
    },

    selectOfficer(officerName) {
        this.selectedOfficer = officerName;
        this.displayTab = "officers";
    },

    selectShip(shipName) {
        this.selectedShip = shipName;
        this.displayTab = "ships";
    },

    getAwardImageByPath(path) {
        if (path === undefined) {
            return Config.RIBBON_MISSING_FILE;
        }
        let correctedPath = Object.keys(this.awardImages).find(k => k.toLowerCase() === path.toLowerCase())
        let id = this.awardImages[correctedPath]
        if (id === undefined) {
            return Config.RIBBON_MISSING_FILE;
        }
        return `https://drive.google.com/uc?export=view&id=${id}`
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
        let records = this.awardsRecords.filter(elem => elem.officer == officerName);
        let awardNames = records.map(r => r.award);

        // One award may have been given multiple times. So we find each award that has been given at least once,
        // and then we attach all records pertaining to that award as a child to the award object.
        let relevantAwards = this.awards.filter(aw => awardNames.includes(aw.title));
        relevantAwards = relevantAwards.map(award => {
            let newAward = award;
            newAward.records = records.filter(r => r.award == award.title)
            return newAward
        });

        // Now we need to filter out all service ribbons except the highest.
        let serviceRibbons = relevantAwards.filter(aw => aw.title.startsWith("Service Ribbon "));
        if (serviceRibbons.length != 0) {
            let highestRibbon = serviceRibbons.sort((a, b) => {
                // remove the first 15 characters (the word "Service Ribbon" and turn the rest into a number)
                let anr = parseInt(a.title.slice(15));
                let bnr = parseInt(b.title.slice(15));
                // if A has the lower number it should be later in the list (as highest should be first), so return 1 then
                return anr < bnr ? 1 : anr == bnr ? 0 : -1
            })[0]
            relevantAwards = relevantAwards.filter(aw => !aw.title.startsWith("Service Ribbon"))
            relevantAwards.push(highestRibbon)
        }

        // Finally, sort awards by precedence in descending order
        return relevantAwards.sort((a, b) => (a.precedence < b.precedence) ? 1 : (a.precedence === b.precedence) ? 0 : -1)
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

    getShortRank(longRank) {
        return this.ranks.find(r => r.name == longRank)?.abbreviation;
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

    refreshData() {
        this.refreshing = true;
        Api.resetCache();
        this.init();
    },

    init() {
        // This will run them all in parallel, which is faster.
        Promise.all([
            Api.fetchOfficerData().then(o => this.updateOfficers(o)),
            Api.fetchShipData().then(s => this.updateShips(s)),
            Api.fetchAwardData().then(a => this.updateAwards(a)),
            Api.fetchAwardRecordData().then(a => this.updateAwardsRecords(a)), 
            Api.fetchRankData().then(r => this.updateRanks(r)), 
            Api.fetchAwardImages().then(r => this.updateAwardImages(r)),
        ])
            .then(() => {
                this.refreshing = false;
            })
    }
})

