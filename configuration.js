// This URL refers to a deployment of the AppsScript code which is contained in the TSNCOR spreadsheet.
// To find that, open the spreadsheet, then go to Extensions --> AppsScript.
// The code there contains an explanation of how to get/update this URL.
const TSNCOR_DEPLOYMENT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyMlAdzKF--hZK-3Lki4SZ8mP_kZhgtl6fzfWCUxWKb8BlOnIteVPN1rHM16Mz33JQ/exec"


// The path suffices for these URLs are also defined in the AppsScript.
export const TSNCOR_OFFICERS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=officers`
export const TSNCOR_AWARDS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=awards`
export const TSNCOR_AWARDS_RECORDS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=awardrecords`
export const TSNCOR_SHIPS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=ships`
export const TSNCOR_RANKS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=ranks`
export const TSNCOR_STARDATES_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=stardates`
export const TSNCOR_QUALIFICATIONS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=qualifications`
export const TSNCOR_QUALIFICATIONS_RECORDS_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?sheet=qualificationrecords`
export const TSNCOR_IMAGES_URL = `${TSNCOR_DEPLOYMENT_WEB_APP_URL}?images`

// Time, in milliseconds, for which records that rarely update are cached.
// These records are basically everything except officers and award records.
// Users can always force a full refresh via the refresh button on the website.
export const LONG_CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 1 week

// Time, in milliseconds, for which records that update more frequently are cached.
// This is currently just the officer records and award records.
// Users can always force a full refresh via the refresh button on the website.
export const SHORT_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Image file which is displayed in the ribbon rack when the actual image is missing.
// To fix missing image files, make sure the image is in the correct google drive folder
// and the path is correctly added to the list of Awards in the COR spreadsheet.
export const RIBBON_MISSING_FILE = "assets/noimage.png";
// Image file which is displayed in the ribbon rack when the actual image is still loading.
export const RIBBON_LOADING_FILE = "assets/loading.gif";
