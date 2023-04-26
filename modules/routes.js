/**
 * This file contains functions that take care of loading the correc content based on the URL.
 */
export function loadRoute() {
    let currentLocation = window.location.href
    let parts = currentLocation.split("/")
    console.log(parts)
}