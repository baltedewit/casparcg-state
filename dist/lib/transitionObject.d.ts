import { CasparCG } from './api';
export declare class TransitionObject {
    _value: string | number | boolean;
    inTransition: Transition;
    changeTransition: Transition;
    outTransition: Transition;
    /** */
    constructor(value?: any, options?: {
        inTransition?: Transition;
        changeTransition?: Transition;
        outTransition?: Transition;
    });
    /** */
    valueOf(): string | number | boolean;
    /** */
    toString(): string;
}
export declare class Transition implements CasparCG.ITransition {
    type: string;
    duration: number;
    easing: string;
    direction: string;
    constructor(typeOrTransition?: string | object, duration?: number, easing?: string, direction?: string);
}
