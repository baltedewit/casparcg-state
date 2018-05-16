"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var TransitionObject = /** @class */ (function () {
    /** */
    function TransitionObject(value, options) {
        if (!_.isUndefined(value)) {
            this._value = value;
        }
        if (options) {
            if (options.inTransition)
                this.inTransition = options.inTransition;
            if (options.changeTransition)
                this.changeTransition = options.changeTransition;
            if (options.outTransition)
                this.outTransition = options.outTransition;
        }
    }
    /** */
    TransitionObject.prototype.valueOf = function () {
        return this._value;
    };
    /** */
    TransitionObject.prototype.toString = function () {
        if (this._value)
            return this._value.toString();
        return '';
    };
    return TransitionObject;
}());
exports.TransitionObject = TransitionObject;
var Transition = /** @class */ (function () {
    function Transition(typeOrTransition, duration, easing, direction) {
        this.type = 'mix';
        this.duration = 0;
        this.easing = 'linear';
        this.direction = 'right';
        var type;
        if (_.isObject(typeOrTransition)) {
            var t = typeOrTransition;
            type = t.type;
            duration = t.duration;
            easing = t.easing;
            direction = t.direction;
        }
        else {
            type = typeOrTransition;
        }
        // @todo: for all: string literal
        if (type) {
            this.type = type;
        }
        if (duration) {
            this.duration = duration;
        }
        if (easing) {
            this.easing = easing;
        }
        if (direction) {
            this.direction = direction;
        }
    }
    return Transition;
}());
exports.Transition = Transition;
//# sourceMappingURL=transitionObject.js.map