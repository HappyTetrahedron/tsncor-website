import * as Store from "./modules/store.js"
import * as Router from "./modules/router.js"
/**
 * This site uses petite-vue for lightweight reactive components. (don't worry, those are just buzzwords)
 * It's a library that greatly simplifies the process of displaying data in the website.
 * This file contains some setup code for petite-vue. The meat of the application is in the HTML files and in the store file (modules/store.js).
 */

import {createApp} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

// Create a new vue app with the store
let app = createApp(
    Store.store
)
// Mount (initialize) the app
app.mount();

// Initialize the store (this triggers fetching officer data)
Store.store.init();

// This bit is for the case where we open a direct link to an officer or ship (i.e. the URL has something like "?officer=so-and-so" at the end)
Router.setStoreFromQuery(Store.store, window.location.search);

// This bit is needed to make the back button in the browser work. Pressing that button causes a "popstate" event.
addEventListener("popstate", (event) => {Router.setStoreFromQuery(Store.store, event.state)})