"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var casparcg_connection_1 = require("casparcg-connection");
var Mixer = /** @class */ (function () {
    function Mixer() {
    }
    Mixer.getValue = function (val) {
        if (_.isObject(val) && val.valueOf)
            return val.valueOf();
        return val;
    };
    Mixer.supportedAttributes = function () {
        return [
            'anchor',
            'blend',
            'brightness',
            'chroma',
            'clip',
            'contrast',
            'crop',
            'fill',
            'keyer',
            'levels',
            'mastervolume',
            'opacity',
            'perspective',
            'rotation',
            'saturation',
            'straightAlpha',
            'volume',
            'bundleWithCommands'
        ];
    };
    Mixer.getDefaultValues = function (attr) {
        // this is a temporary function, to replaced by some logic from ccg-connection
        switch (attr) {
            case 'anchor':
                return {
                    x: 0,
                    y: 0
                };
            case 'blend':
                return casparcg_connection_1.Enum.BlendMode.NORMAL;
            case 'brightness':
                return 1;
            case 'chroma':
                return {
                    keyer: casparcg_connection_1.Enum.Chroma.NONE,
                    threshold: 0,
                    softness: 0,
                    spill: 0
                };
            case 'clip':
                return {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                };
            case 'contrast':
                return 1;
            case 'crop':
                return {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                };
            case 'fill':
                return {
                    x: 0,
                    y: 0,
                    xScale: 1,
                    yScale: 1
                };
            // grid
            case 'keyer':// Layer mask
                return false;
            case 'levels':
                return {
                    minInput: 0,
                    maxInput: 1,
                    gamma: 1,
                    minOutput: 0,
                    maxOutput: 1
                };
            case 'mastervolume':
                return 1;
            // mipmap
            case 'opacity':
                return 1;
            case 'perspective':
                return {
                    topLeftX: 0,
                    topLeftY: 0,
                    topRightX: 1,
                    topRightY: 0,
                    bottomRightX: 1,
                    bottomRightY: 1,
                    bottomLeftX: 0,
                    bottomLeftY: 1
                };
            case 'rotation':
                return 0;
            case 'saturation':
                return 1;
            case 'straightAlpha':
                return false;
            case 'volume':
                return 1;
            default:
                // code...
                break;
        }
        return null;
    };
    return Mixer;
}());
exports.Mixer = Mixer;
//# sourceMappingURL=mixer.js.map