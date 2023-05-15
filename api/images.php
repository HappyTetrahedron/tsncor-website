<?php
// This code fetches award images from Google Drive and stores them locally on disk.
// It acts as a cache layer between the Google Drive and the website, making the loading of images
// much faster.

include("configuration.php");
include("cache_function.php");

$file_key = htmlentities($_GET["key"]); // This will be a Google Drive file ID
$drive_url = "https://drive.google.com/uc?export=view&id={$file_key}"; // URL of file on google drive
$cache_seconds = intval(htmlentities($_GET["max_age"] ?? $DEFAULT_CACHE_TIME_SECONDS));

fetch_with_cache($drive_url, $file_key, $cache_seconds);

// This ends the currently running process, so we don't keep hogging server resources.
die();
?>