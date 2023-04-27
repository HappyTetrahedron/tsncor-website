/**
 * This module contains functions to retrieve data from the TSNCOR spreadsheet (which acts kind of like an API).
 * It also caches the results in local browser storage.
 */
import * as Config from "../configuration.js"

const cache = await caches.open("tsncor");

export async function fetchOfficerData() {
    let officers = await fetchWithCache(Config.TSNCOR_OFFICERS_URL, Config.SHORT_CACHE_DURATION);
    return officers;
}

export async function fetchShipData() {
    let ships = await fetchWithCache(Config.TSNCOR_SHIPS_URL, Config.LONG_CACHE_DURATION);
    return ships;
}

export async function fetchAwardData() {
    let awards = await fetchWithCache(Config.TSNCOR_AWARDS_URL, Config.LONG_CACHE_DURATION);
    return awards;
}

export async function fetchAwardRecordData() {
    let awardsRecords = await fetchWithCache(Config.TSNCOR_AWARDS_RECORDS_URL, Config.LONG_CACHE_DURATION);
    return awardsRecords;
}

export async function fetchRankData() {
    let ranks = await fetchWithCache(Config.TSNCOR_RANKS_URL, Config.LONG_CACHE_DURATION);
    return ranks;
}

export async function fetchAwardImages() {
    let awardImages = await fetchWithCache(Config.TSNCOR_IMAGES_URL, Config.LONG_CACHE_DURATION)
    return awardImages;
}

export async function resetCache() {
    localStorage.clear();
}

async function fetchWithCache(url, cacheDuration) {
    let lastCached = localStorage.getItem(url)
    if (lastCached < Date.now() - cacheDuration) {
        let res = await fetch(url, {redirect: "follow"})
        await cache.put(url, res);
        localStorage.setItem(url, Date.now())
    }
    let res = await cache.match(url);
    return await res.json()
}