import * as Api from "./modules/api.js"
import * as Data from "./modules/data.js"
import * as Render from "./modules/render.js"

await Api.fetchAll();
console.log(Data.getOfficerRecordByName("Joy Tetra"));
console.log(Data.getShipByName("Sabre"));

Render.renderOfficerList();

