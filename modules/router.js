export function setQueryFromStore(store) {
    let uri = window.location.href.split('?')[0];

    if (store.selectedEntry == "") { 
        history.pushState("", "", uri);
        return
    }

    let query = `?${store.displayTab}=${store.selectedEntry}`
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