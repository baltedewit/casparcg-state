"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var api_1 = require("./api");
var CasparCGFull;
(function (CasparCGFull) {
    var State = /** @class */ (function (_super) {
        tslib_1.__extends(State, _super);
        function State() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.channels = {};
            return _this;
        }
        return State;
    }(api_1.CasparCG.State));
    CasparCGFull.State = State;
    var Channel = /** @class */ (function (_super) {
        tslib_1.__extends(Channel, _super);
        function Channel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.layers = {};
            return _this;
        }
        return Channel;
    }(api_1.CasparCG.Channel));
    CasparCGFull.Channel = Channel;
    var Layer = /** @class */ (function (_super) {
        tslib_1.__extends(Layer, _super);
        function Layer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Layer;
    }(api_1.CasparCG.ILayerBase));
    CasparCGFull.Layer = Layer;
})(CasparCGFull = exports.CasparCGFull || (exports.CasparCGFull = {}));
//# sourceMappingURL=interfaces.js.map