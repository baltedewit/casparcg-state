import { Command as CommandNS } from 'casparcg-connection';
import IAMCPCommandVO = CommandNS.IAMCPCommandVO;
import { CasparCG } from './api';
import { CasparCGFull as CF } from './interfaces';
import { StateObjectStorage } from './stateObjectStorage';
/** */
export declare class CasparCGState0 {
    bufferedCommands: Array<{
        cmd: IAMCPCommandVO;
        additionalLayerState?: CF.Layer;
    }>;
    protected _currentStateStorage: StateObjectStorage;
    private minTimeSincePlay;
    private _currentTimeFunction;
    private _isInitialised;
    private _externalLog?;
    /** */
    constructor(config?: {
        currentTime?: () => number;
        getMediaDurationCallback?: (clip: string, callback: (duration: number) => void) => void;
        externalStorage?: (action: string, data: Object | null) => CF.State;
        externalLog?: (arg0?: any, arg1?: any, arg2?: any, arg3?: any) => void;
    });
    readonly version: string;
    /**
     * Initializes the state by using channel info
     * @param {any} channels [description]
     */
    initStateFromChannelInfo(channels: Array<CasparCG.ChannelInfo>): void;
    /**
     * Set the current statue to a provided state
     * @param {CasparCG.State} state The new state
     */
    setState(state: CF.State): void;
    /**
     * Get the gurrent state
     * @param  {true}}   options [description]
     * @return {CF.State} The current state
     */
    getState(): CF.State;
    /**
     * Resets / clears the current state
     */
    clearState(): void;
    /**
     * A soft clear, ie clears any content, but keeps channel settings
     */
    softClearState(): void;
    /**
     * Applies commands to current state
     * @param {CF.Layer}>} commands [description]
     */
    applyCommands(commands: Array<{
        cmd: IAMCPCommandVO;
        additionalLayerState?: CF.Layer;
    }>): void;
    /**
     * Iterates over commands and applies new state to provided state object
     * @param {any}     currentState
     * @param {CF.Layer}>} commands
     */
    applyCommandsToState(currentState: any, commands: Array<{
        cmd: IAMCPCommandVO;
        additionalLayerState?: CF.Layer;
    }>): void;
    getDiff(newState: CasparCG.State): Array<{
        cmds: Array<IAMCPCommandVO>;
        additionalLayerState?: CF.Layer;
    }>;
    /** */
    diffStates(oldState: CF.State, newState: CasparCG.State): Array<{
        cmds: Array<IAMCPCommandVO>;
        additionalLayerState?: CF.Layer;
    }>;
    valueOf(): CF.State;
    toString(): string;
    /** */
    /** */
    isInitialised: boolean;
    private log(...args);
    /** */
    private ensureLayer(channel, layerNo);
    private compareAttrs(obj0, obj1, attrs, strict?);
}
export declare class CasparCGState extends CasparCGState0 {
    /**
     * Set the current state to provided state
     * @param state The new state
     */
    setState(state: CF.State): void;
    /**
     * Get the gurrent state
     * @param  {true}}   options [description]
     * @return {CF.State} The current state
     */
    getState(): CF.State;
}
