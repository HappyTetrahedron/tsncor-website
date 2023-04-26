/**
 * This module contains functions to retrieve data from the TSNCOR spreadsheet (which acts kind of like an API).
 * It is eventually also supposed to do local caching, but that's not in yet.
 */
import * as Config from "../configuration.js"

// TODO: caching.
var officers;
var awards;
var awardsRecords;
var ranks;
var ships;
var awardImages;

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

export async function fetchAwardImages() {
    awardImages = await fetchFromApi(Config.TSNCOR_IMAGES_URL)
    return awardImages;
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