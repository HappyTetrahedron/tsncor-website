import * as Store from "./modules/store.js"
import {createApp} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

let app = createApp(
    Store.store
)
app.mount()
Store.store.init();