/**
 * This module contains routing functions. It basically takes care of adding the "?officer=so-and-so" part to the URL (aka the query) when you click on an officer,
 * and if you're direct-linking to an URL with that query bit already on it, it also takes care of selecting the correct officer accordingly.
 *
 * Why is this needed? Because when clicking on an officer, you're not opening a link to a new page. Instead, you're causing the javascript to change
 * the current page. That does not normally change the URL in the browser's address bar, so we have to do it ourselves.
 */
export function setQueryFromStore(store) {
    let uri = window.location.href.split('?')[0];

    if (store.selectedEntry == "") { 
        history.pushState("", "", uri);
        return
    }

    let query = `?${store.displayTab}=${store.selectedEntry}`
    // history.pushState updates the URL in the address bar and also makes it so that the back button in the browser works as expected.
    history.pushState(query, "", `${uri}${query}`)
}

export function setStoreFromQuery(store, query) {
    if (!query || query == "") {
        store.selectedEntry = "";
        return;
    }

    let queries = query.slice(1).split('&'); // remove 1st character (the '?'), then split at every '&'

    queries.forEach(q => {
        let parts = q.split('=');
        if (store.availableTabs.includes(parts[0])) {
            store.displayTab = parts[0];
            store.selectedEntry = decodeURIComponent(parts[1]);
        }
    });
}