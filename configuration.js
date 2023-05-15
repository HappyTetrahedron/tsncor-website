// This URL refers to a deployment of the AppsScript code which is contained in the TSNCOR spreadsheet.
// To find that, open the spreadsheet, then go to Extensions --> AppsScript.
// The code there contains an explanation of how to get/update this URL.
// const TSNCOR_DEPLOYMENT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyeDkrUHyaVfTBjYge400j-Hz6lxNw5sBlOKhjfTS1lzdeVkQqjL7ZeZROtWyaMmqk/exec"


export const TSNCOR_OFFICERS_URL = "api/appsscript.php?key=sheet&val=officers&max_age=3600";
export const TSNCOR_AWARDS_URL = "api/appsscript.php?key=sheet&val=awards";
export const TSNCOR_AWARDS_RECORDS_URL = "api/appsscript.php?key=sheet&val=awardrecords";
export const TSNCOR_SHIPS_URL = "api/appsscript.php?key=sheet&val=ships";
export const TSNCOR_RANKS_URL = "api/appsscript.php?key=sheet&val=ranks";
export const TSNCOR_STARDATES_URL = "api/appsscript.php?key=sheet&val=stardates";
export const TSNCOR_IMAGES_URL = "api/appsscript.php?key=images&val=true";

export const AWARD_IMAGE_BASE_URL = "api/images.php?key="

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