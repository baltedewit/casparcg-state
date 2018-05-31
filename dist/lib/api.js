"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var transitionObject_1 = require("./transitionObject");
var CasparCG;
(function (CasparCG) {
    var Mappings = /** @class */ (function () {
        function Mappings() {
            this.layers = {};
        }
        return Mappings;
    }());
    CasparCG.Mappings = Mappings;
    var Mapping = /** @class */ (function () {
        function Mapping() {
        }
        return Mapping;
    }());
    CasparCG.Mapping = Mapping;
    var State = /** @class */ (function () {
        function State() {
            this.channels = {};
        }
        return State;
    }());
    CasparCG.State = State;
    var ChannelInfo = /** @class */ (function () {
        function ChannelInfo() {
        }
        return ChannelInfo;
    }());
    CasparCG.ChannelInfo = ChannelInfo;
    var Channel = /** @class */ (function (_super) {
        tslib_1.__extends(Channel, _super);
        function Channel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.layers = {};
            return _this;
        }
        return Channel;
    }(ChannelInfo));
    CasparCG.Channel = Channel;
    var ILayerBase = /** @class */ (function () {
        function ILayerBase() {
        }
        return ILayerBase;
    }());
    CasparCG.ILayerBase = ILayerBase;
    var NextUp = /** @class */ (function (_super) {
        tslib_1.__extends(NextUp, _super);
        function NextUp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return NextUp;
    }(ILayerBase));
    CasparCG.NextUp = NextUp;
    var LayerContentType;
    (function (LayerContentType) {
        LayerContentType["NOTHING"] = "";
        LayerContentType["MEDIA"] = "media";
        LayerContentType["TEMPLATE"] = "template";
        LayerContentType["HTMLPAGE"] = "htmlpage";
        LayerContentType["INPUT"] = "input";
        LayerContentType["ROUTE"] = "route";
        LayerContentType["RECORD"] = "record";
        LayerContentType["FUNCTION"] = "function";
    })(LayerContentType = CasparCG.LayerContentType || (CasparCG.LayerContentType = {}));
    var TransitionObject = /** @class */ (function (_super) {
        tslib_1.__extends(TransitionObject, _super);
        function TransitionObject() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TransitionObject;
    }(transitionObject_1.TransitionObject));
    CasparCG.TransitionObject = TransitionObject;
    var Transition = /** @class */ (function (_super) {
        tslib_1.__extends(Transition, _super);
        function Transition() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Transition;
    }(transitionObject_1.Transition));
    CasparCG.Transition = Transition;
})(CasparCG = exports.CasparCG || (exports.CasparCG = {}));
//# sourceMappingURL=api.js.map