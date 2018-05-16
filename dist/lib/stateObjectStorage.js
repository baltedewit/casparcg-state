"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
/**
 * StateObjectStorage is used for exposing the internal state variable
 * By default, it is storing the state as an internal variable,
 * byt may be using an external storage function for fetching/storing the state.
 */
var StateObjectStorage = /** @class */ (function () {
    function StateObjectStorage() {
        this._internalState = new interfaces_1.CasparCGFull.State();
    }
    StateObjectStorage.prototype.assignExternalStorage = function (fcn) {
        this._externalStorage = fcn;
    };
    StateObjectStorage.prototype.fetchState = function () {
        if (this._externalStorage) {
            return this._externalStorage('fetch', null);
        }
        else {
            return this._internalState;
        }
    };
    StateObjectStorage.prototype.storeState = function (data) {
        if (this._externalStorage) {
            this._externalStorage('store', data);
        }
        else {
            this._internalState = data;
        }
    };
    StateObjectStorage.prototype.clearState = function () {
        if (this._externalStorage) {
            this._externalStorage('clear');
        }
        else {
            this._internalState = new interfaces_1.CasparCGFull.State();
        }
    };
    return StateObjectStorage;
}());
exports.StateObjectStorage = StateObjectStorage;
//# sourceMappingURL=stateObjectStorage.js.map