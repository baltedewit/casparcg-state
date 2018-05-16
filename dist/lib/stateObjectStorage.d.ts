import { CasparCGFull as CF } from './interfaces';
/**
 * StateObjectStorage is used for exposing the internal state variable
 * By default, it is storing the state as an internal variable,
 * byt may be using an external storage function for fetching/storing the state.
 */
export declare class StateObjectStorage {
    private _internalState;
    private _externalStorage;
    assignExternalStorage(fcn: (action: string, data: Object | null) => CF.State): void;
    fetchState(): CF.State;
    storeState(data: CF.State): void;
    clearState(): void;
}
