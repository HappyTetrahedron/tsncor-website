/**
 * This module contains a reactive store.
 * The store contains functions that expose, filter, transform, combine or otherwise wrangle the spreadsheet data into submission.
 * The store functions can be used in the website where the data is then displayed.
 * The advantage of using a reactive store: If the data changes, the website is updated automatically!
 * For this to work, data must always be modified through store functions. So, `store.updateOfficers(newValue)` instead of `store.officers = newValue`.
 */

import * as Api from "./api.js"
import * as Router from "./router.js"
import * as Config from "../configuration.js"
import {reactive} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

export const store = reactive({
    availableTabs: [
        "ships",
        "officers",
    ],

    officers: [],
    ships: [],
    awards: [],
    awardsRecords: [],
    ranks: [],
    stardates: [],
    assignmentRecords: [],
    awardImages: {},

    refreshing: false,

    officerSearch: "",
    showInactive: false,
    officersLoading: true,

    selectedOfficer: "",
    selectedShip: "",
    shipsLoading: true,

    displayTab: "officers",

    get selectedEntry() {
        if (this.displayTab == "ships") {
            return this.selectedShip
        }
        if (this.displayTab == "officers") {
            return this.selectedOfficer
        }
    },

    set selectedEntry(newEntry) {
        if (this.displayTab == "ships") {
            this.selectedShip = newEntry;
        }
        if (this.displayTab == "officers") {
            this.selectedOfficer = newEntry;
        }

    },

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
        return this.getShipByFullName(this.selectedShip);
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
    updateAssignmentRecords(assignmentRecords) {
        this.assignmentRecords = assignmentRecords;
    },
    updateRanks(ranks) {
        this.ranks = ranks;
    },
    updateStardates(stardates) {
        this.stardates = stardates;
    },
    updateAwardImages(awardImages) {
        this.awardImages = awardImages;
    },

    showOfficers() {
        this.displayTab = "officers";
    },

    showShips() {
        this.displayTab = "ships";
    },

    selectOfficer(officerName) {
        this.selectedOfficer = officerName;
        this.showOfficers();
        Router.setQueryFromStore(this);
    },

    selectShip(shipName) {
        this.selectedShip = shipName;
        this.showShips();
        Router.setQueryFromStore(this);
    },

    getAwardImageByPath(path) {
        if (path === undefined) {
            return Config.RIBBON_MISSING_FILE;
        }
        if (Object.keys(this.awardImages).length === 0) {
            // Award images data has not yet been loaded
            return Config.RIBBON_LOADING_FILE;
        }
        let correctedPath = Object.keys(this.awardImages).find(k => k.toLowerCase() === path.toLowerCase())
        let id = this.awardImages[correctedPath]
        if (id === undefined) {
            return Config.RIBBON_MISSING_FILE;
        }
        return `https://drive.google.com/uc?export=view&id=${id}`
    },

    getOfficerRecordByName(name) {
        let officer = this.getSparseOfficerRecordByName(name);
        if (officer === undefined) {
            return undefined
        }
        // We can't directly modify the officer object we just filtered out of the list.
        // Since that is tracked by petite-vue, it will trigger an update of itself, which causes an error.
        // Instead, we copy the officer data into a new object, and then add more data in there.
        let fullRecord = {}
        Object.assign(fullRecord, officer)
        Object.assign(fullRecord, {
            assignments: this.getAssignmentsForOfficer(name),
            awards: this.getAwardsForOfficer(name),
        })
        return fullRecord;
    },

    getSparseOfficerRecordByName(name) {
        // This returns just the plain officer data without any extra information added in.
        // If the extra information is not needed, this one is more performant.
        let officer = this.officers.find(elem => elem.name == name);
        return officer;
    },

    getAwardsForOfficer(officerName) {
        let records = this.awardsRecords.filter(elem => elem.officer == officerName);
        let awardNames = records.map(r => r.award);

        // One award may have been given multiple times. So we find each award that has been given at least once,
        // and then we attach all records pertaining to that award as a child to the award object.
        let relevantAwards = this.awards.filter(aw => awardNames.includes(aw.title));
        relevantAwards = relevantAwards.map(award => {
            let newAward = {...award};
            newAward.records = records.filter(r => r.award == award.title);
            return newAward;
        });

        // Furthermore, some awards form a progression (e.g. 1 year service -> 2 year service -> 3 year service etc.)
        // We only want to show the latest award of each progression.
        // First, find all non-empty progressions
        let progressions = relevantAwards.map(aw => aw.progression).filter(p => p != "")
        let uniqueProgressions = Array.from(new Set(progressions))

        // Now, for each progression we have got, actually do the collecting
        uniqueProgressions.forEach(progression => {
            relevantAwards = collateAwardsToHighest(relevantAwards, progression)
        });

        // Finally, sort awards by precedence in descending order
        return relevantAwards.sort((a, b) => (a.precedence < b.precedence) ? 1 : (a.precedence === b.precedence) ? 0 : -1)
    },

    getAssignmentsForOfficer(officerName) {
        let records = this.assignmentRecords
            .filter(elem => elem.officer == officerName);
        return records;
    },

    getPreviousAssignmentsForShip(shipFullName) {
        let records = this.assignmentRecords
            .filter(elem => elem.ship == shipFullName)
            .filter(elem => elem.end_of_assignment != "");
        return records;
    },

    getShipByFullName(name) {
        let ship = this.ships.find(elem => elem.full_name == name);
        if (ship === undefined) {
            return undefined
        }
        // We can't directly modify the ship object we just filtered out of the list.
        // Since that is tracked by petite-vue, it will trigger an update of itself, which causes an error.
        // Instead, we copy the ship data into a new object, and then add more data in there.
        let fullShipRecord = {}
        Object.assign(fullShipRecord, ship)
        Object.assign(fullShipRecord, {
            previous_officers: this.getPreviousAssignmentsForShip(name),
            assigned_officers: this.getOfficersForShip(name),
        })
        return fullShipRecord;
    },

    getOfficersForShip(shipName) {
        return this.officers.filter(elem => elem.current_assignment == shipName);
    },

    getShortRank(longRank) {
        return this.ranks.find(r => r.name == longRank)?.abbreviation;
    },

    formatDate(dateString) {
        var date = new Date(dateString);
        if (isNaN(date)) { // this means it wasn't a valid date. Happens sometimes when people put "???" into the spreadsheet.
            return dateString; // In that case, leave it as-is.
        }
        // JavaScript months are 0-based, meaning January is month 0, so we add 1 to the month.
        return `${date.getDate()}${(date.getMonth()+1)}${(date.getFullYear()-2000)}-${this.getStarYearForDate(date)}`;
    },

    getStarYearForDate(date) {
        if (this.stardates.length === 0) {
            // Stardates not ready yet :(
            return "????";
        }
        let filteredStardates = this.stardates
            .filter(sd => new Date(sd.start_date_irl) < date) // get only dates that are before our reference date
            .sort((a, b) => a.stardate_year < b.stardate_year ? 1 : a.stardate_year === b.stardate_year ? 0 : -1); // sort highest first

        return filteredStardates[0].stardate_year; // get the first (highest) and return it
    },

    officerHasRank(officer, rank) {
        // The !! is a common trick to turn any value into a boolean based on its inherent truthiness.
        return !!officer[rank.shortcode.toLowerCase()];

    },

    /**
     * This is a comparator for officer objects. It is used to sort lists. 
     * It decides what order items should be in. In this particular case, we're
     * comparing officers by their rank and seniority, to figure out who is higher rank.
     * If item a should be in front of item b, it returns -1. If b should be in front, it returns 1.
     * If a and b are "the same" (we can't tell which one should be in front), the comparator
     * has to return 0.
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

        let senA = new Date(a.seniority)
        let senB = new Date(b.seniority)
        // seniority is a date. an *earlier* date means the officer is *more senior*.
        if (senA > senB) return -1;
        if (senA < senB) return 1;
        return 0;
    },

    refreshData() {
        this.refreshing = true;
        this.officersLoading = true;
        this.shipsLoading = true;
        Api.resetCache();
        this.init();
    },

    init() {
        // This will fetch them all in parallel, which is faster.
        Promise.all([
            Api.fetchOfficerData()
                .then(o => this.updateOfficers(o))
                .then(() => {this.officersLoading = false}),
            Api.fetchShipData()
                .then(s => this.updateShips(s))
                .then(() => {this.shipsLoading = false}),
            Api.fetchAwardData().then(a => this.updateAwards(a)),
            Api.fetchAwardRecordData().then(a => this.updateAwardsRecords(a)), 
            Api.fetchAssignmentRecordData().then(a => this.updateAssignmentRecords(a)),
            Api.fetchRankData().then(r => this.updateRanks(r)),
            Api.fetchStardateData().then(r => this.updateStardates(r)),
            Api.fetchAwardImages().then(r => this.updateAwardImages(r)),
        ])
            .then(() => {
                this.refreshing = false;
            })
    }
})

/**
 * Given a list of awards and a progression (such as "Service Ribbon"),
 * this takes all the awards from this progression out of the list
 * save for the highest/most recent.
 * 
 * @param {Object[]} awards
 * @param {string} progression
 * @returns 
 */
function collateAwardsToHighest(awards, progression) {
    // Get all the awards of the progression in question
    let relevantAwards = awards.filter(aw => (aw.progression == progression));
    if (relevantAwards.length != 0) {
        // Sort them by precedence, highest first
        let sorted = relevantAwards.sort((a, b) =>
            a.precedence < b.precedence ? 1 : a.precedence == b.precedence ? 0 : -1
        )
        // The highest is the one we want to keep
        let highest = sorted[0];

        // But we want to also keep all the records of all the lower awards
        let records = sorted.flatMap(award => award.records);
        highest.records = records;

        // Remove all awards from this progression from the original list
        awards = awards.filter(aw => aw.progression != progression);

        // Put the highest award back into the list
        awards.push(highest);
    }
    return awards;
}
