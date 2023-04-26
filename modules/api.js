/**
 * This module contains functions to retrieve data from the TSNCOR spreadsheet (which acts kind of like an API).
 */
import * as Config from "../configuration.js"

export var initialized = false;

export var officers;
export var awards;
export var awardsRecords;
export var ranks;
export var ships;
// et cetera

export async function fetchAll() {
    // This will run them all in parallel, which is faster.
    let res = await Promise.all([
        fetchOfficerData(),
        fetchShipData(),
        fetchAwardData(),
        fetchAwardRecordData(),
        fetchRankData(),
    ])

    // Other files can use this to figure out whether the data is here yet.
    initialized = true;

    return res;
}

export async function fetchOfficerData() {
    officers = await fetchFromApi(Config.TSNCOR_OFFICERS_URL);
    return officers;
}

export async function fetchShipData() {
    ships = await fetchFromApi(Config.TSNCOR_SHIPS_URL);
    return ships;
}

export async function fetchAwardData() {
    awards = await fetchFromApi(Config.TSNCOR_AWARDS_URL);
    return awards;
}

export async function fetchAwardRecordData() {
    awardsRecords = await fetchFromApi(Config.TSNCOR_AWARDS_RECORDS_URL);
    return awardsRecords;
}

export async function fetchRankData() {
    ranks = await fetchFromApi(Config.TSNCOR_RANKS_URL);
    return ranks;
}

async function fetchFromApi(url) {
    let res = await fetch(
        url,
        {
            redirect: "follow", // Apps Script serves the result with a redirect so this is required
            cache: "force-cache" // Force the browser to cache the result, since it shouldn't change often
        }
    )
    return await res.json()
}