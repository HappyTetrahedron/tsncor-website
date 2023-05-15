<?php
// This code fetches data from the Google Sheet via Apps Script, and stores it locally on the webserver.
// It acts as a cache layer between the Google Sheet and the website, making the loading of data
// much faster.

include("configuration.php");
include("cache_function.php");


$query_key = htmlentities($_GET["key"]);
$query_val = htmlentities($_GET["val"]);
$cache_seconds = intval(htmlentities($_GET["max_age"] ?? $DEFAULT_CACHE_TIME_SECONDS));

$appsscript_url = "{$TSNCOR_DEPLOYMENT_WEB_APP_URL}?{$query_key}={$query_val}";
$file_path = "{$query_key}_{$query_val}.json"; // Path of file on local server, relative to current directory

fetch_with_cache($appsscript_url, $file_path, $cache_seconds);

// This ends the currently running process, so we don't keep hogging server resources.
die();
?>