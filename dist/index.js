"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./lib/api"), exports);
tslib_1.__exportStar(require("./lib/casparCGState"), exports);
/* =========================================*/
/* ========== TEST CODE ====================*

import {Command as CommandNS, AMCP} from "casparcg-connection";
import IAMCPCommand = CommandNS.IAMCPCommand;

import {StateObject as stateNS} from "./lib/StateObject";

import {CasparCGState} from "./CasparCGState";

let myTestState0: CasparCGState = new CasparCGState();

// Make some test commands:
let myTestPlayCommand: IAMCPCommand = new AMCP.PlayCommand({
    channel: 1,
    layer: 10,
    opacity: .8
});

//myTestPlayCommand;
myTestState0.applyCommands([myTestPlayCommand.serialize()]);

let myState0: stateNS.CasparCG = myTestState0.getState();
console.log(new CasparCGState().diffStates(new CasparCGState().getState(), myState0));*/
//# sourceMappingURL=index.js.map