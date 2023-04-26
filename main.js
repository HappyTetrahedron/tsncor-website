import * as Store from "./modules/store.js"
/**
 * This site uses petite-vue for lightweight reactive components. (don't worry, those are just buzzwords)
 * It's a library that greatly simplifies the process of displaying data in the website.
 * This file contains some setup code for petite-vue. The meat of the application is in the HTML files and in the store file (modules/store.js).
 */

import {createApp} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

let app = createApp(
    Store.store
)
app.mount()
Store.store.init();