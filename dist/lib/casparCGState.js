"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _ = require("underscore");
var clone = require('fast-clone');
var casparcg_connection_1 = require("casparcg-connection");
var api_1 = require("./api");
var interfaces_1 = require("./interfaces");
var mixer_1 = require("./mixer");
var transitionObject_1 = require("./transitionObject");
var stateObjectStorage_1 = require("./stateObjectStorage");
var CasparCGStateVersion = '2017-11-06 19:15';
// config NS
// import {Config as ConfigNS} from "casparcg-connection";
// import CasparCGConfig207 = ConfigNS.v207.CasparCGConfigVO;
// import CasparCGConfig210 = ConfigNS.v21x.CasparCGConfigVO;
/** */
var CasparCGState0 = /** @class */ (function () {
    /** */
    function CasparCGState0(config) {
        this.bufferedCommands = [];
        this._currentStateStorage = new stateObjectStorage_1.StateObjectStorage();
        this.minTimeSincePlay = 0.2;
        // set the callback for handling time messurement
        if (config && config.currentTime) {
            this._currentTimeFunction = config.currentTime;
        }
        else {
            this._currentTimeFunction = function () {
                return Date.now() / 1000;
            };
        }
        // Verify this._currentTimeFunction
        var time = this._currentTimeFunction();
        if (!time || !_.isNumber(time) || !(time > 0))
            throw Error('currentTime function should return a positive number! (got ' + time + ')');
        // set the callback for handling media duration query
        /* if (config && config.getMediaDurationCallback) {
            this._getMediaDuration = (clip: string, channelNo: number, layerNo: number) => {
                if (config.getMediaDurationCallback) {
                    config.getMediaDurationCallback!(clip, (duration: number) => {
                        this._applyState(channelNo, layerNo, { duration: duration })
                    })
                }
            }
        } else {
            this._getMediaDuration = (clip: string, channelNo: number, layerNo: number) => {
                // clip
                this._applyState(channelNo, layerNo, { duration: null })
            }
        } */
        // set the callback for handling externalStorage
        if (config && config.externalStorage) {
            this._currentStateStorage.assignExternalStorage(config.externalStorage);
        }
        if (config && config.externalLog) {
            this._externalLog = config.externalLog;
        }
    }
    Object.defineProperty(CasparCGState0.prototype, "version", {
        get: function () {
            return CasparCGStateVersion;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Initializes the state by using channel info
     * @param {any} channels [description]
     */
    CasparCGState0.prototype.initStateFromChannelInfo = function (channels) {
        var currentState = this._currentStateStorage.fetchState();
        _.each(channels, function (channel, i) {
            if (!channel.videoMode)
                throw Error('State: Missing channel.videoMode!');
            if (!channel.fps)
                throw Error('State: Missing channel.fps!');
            if (!(_.isNumber(channel.fps) && channel.fps > 0))
                throw Error('State:Bad channel.fps, it should be a number > 0 (got ' + channel.fps + ')!');
            var existingChannel = currentState.channels[(i + 1) + ''];
            if (!existingChannel) {
                existingChannel = new interfaces_1.CasparCGFull.Channel();
                existingChannel.channelNo = i + 1;
                currentState.channels[existingChannel.channelNo] = existingChannel;
            }
            existingChannel.videoMode = channel.videoMode;
            existingChannel.fps = channel.fps;
            existingChannel.layers = {};
        });
        // Save new state:
        this._currentStateStorage.storeState(currentState);
        this.isInitialised = true;
    };
    /**
     * Set the current statue to a provided state
     * @param {CasparCG.State} state The new state
     */
    CasparCGState0.prototype.setState = function (state) {
        this._currentStateStorage.storeState(state);
    };
    /**
     * Get the gurrent state
     * @param  {true}}   options [description]
     * @return {CF.State} The current state
     */
    CasparCGState0.prototype.getState = function () {
        if (!this.isInitialised) {
            throw new Error('CasparCG State is not initialised');
        }
        return this._currentStateStorage.fetchState();
    };
    /**
     * Resets / clears the current state
     */
    CasparCGState0.prototype.clearState = function () {
        this._currentStateStorage.clearState();
        this.isInitialised = false;
    };
    /**
     * A soft clear, ie clears any content, but keeps channel settings
     */
    CasparCGState0.prototype.softClearState = function () {
        var currentState = this._currentStateStorage.fetchState();
        _.each(currentState.channels, function (channel) {
            channel.layers = {};
        });
        // Save new state:
        this._currentStateStorage.storeState(currentState);
    };
    /**
     * Applies commands to current state
     * @param {CF.Layer}>} commands [description]
     */
    CasparCGState0.prototype.applyCommands = function (commands) {
        // buffer commands until we are initialised
        if (!this.isInitialised) {
            this.bufferedCommands = this.bufferedCommands.concat(commands);
            return;
        }
        var currentState = this._currentStateStorage.fetchState();
        // Applies commands to target state
        this.applyCommandsToState(currentState, commands);
        // Save new state:
        this._currentStateStorage.storeState(currentState);
    };
    /**
     * Iterates over commands and applies new state to provided state object
     * @param {any}     currentState
     * @param {CF.Layer}>} commands
     */
    CasparCGState0.prototype.applyCommandsToState = function (currentState, commands) {
        var _this = this;
        var setMixerState = function (channel, command, attr, subValue) {
            var layer = _this.ensureLayer(channel, command.layer);
            if (!layer.mixer)
                layer.mixer = new mixer_1.Mixer();
            /*
            console.log('setMixerState '+attr);
            console.log(subValue);
            console.log(command)
            */
            if ((command._objectParams || {})['_defaultOptions']) {
                // the command sent, contains "default parameters"
                delete layer.mixer[attr];
            }
            else {
                if (_.isArray(subValue)) {
                    var o_1 = {};
                    _.each(subValue, function (sv) {
                        o_1[sv] = command._objectParams[sv];
                    });
                    layer.mixer[attr] = new transitionObject_1.TransitionObject(o_1);
                }
                else if (_.isString(subValue)) {
                    var o = command._objectParams[subValue];
                    layer.mixer[attr] = new transitionObject_1.TransitionObject(o);
                }
            }
        };
        commands.forEach(function (i) {
            var command = i.cmd;
            var channelNo = (command._objectParams || {})['channel'] || command.channel;
            var layerNo = (command._objectParams || {})['layer'] || command.layer;
            var channel = currentState.channels[channelNo + ''];
            // let layer: CF.Layer | undefined
            if (!channel) {
                // Create new empty channel:
                channel = new interfaces_1.CasparCGFull.Channel();
                channel.channelNo = channelNo;
                currentState.channels[channel.channelNo + ''] = channel;
            }
            var cmdName = command._commandName;
            if (cmdName === 'PlayCommand' || cmdName === 'LoadCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                var seek = command._objectParams['seek'];
                var playDeltaTime = (seek || 0) / channel.fps;
                if (command._objectParams['clip']) {
                    layer.content = api_1.CasparCG.LayerContentType.MEDIA;
                    layer.playing = (cmdName === 'PlayCommand');
                    layer.media = new transitionObject_1.TransitionObject(command._objectParams['clip']);
                    if (command._objectParams['transition']) {
                        layer.media.inTransition = new transitionObject_1.Transition(command._objectParams['transition'], +(command._objectParams['transitionDuration'] || 0), command._objectParams['transitionEasing'], command._objectParams['transitionDirection']);
                    }
                    layer.looping = !!command._objectParams['loop'];
                    if (i.additionalLayerState) {
                        layer.playTime = i.additionalLayerState.playTime || 0;
                    }
                    else {
                        layer.playTime = _this._currentTimeFunction() - playDeltaTime;
                    }
                    layer.pauseTime = Number(command._objectParams['pauseTime']) || 0;
                    // this._getMediaDuration((layer.media || '').toString(), channel.channelNo, layer.layerNo)
                }
                else {
                    if (cmdName === 'PlayCommand' && layer.content === api_1.CasparCG.LayerContentType.MEDIA && layer.media && layer.pauseTime && layer.playTime) {
                        // resuming a paused clip
                        layer.playing = true;
                        var playedTime = layer.playTime - layer.pauseTime;
                        layer.playTime = _this._currentTimeFunction() - playedTime; // "move" the clip to new start time
                        layer.pauseTime = 0;
                    }
                }
                if (i.additionalLayerState && i.additionalLayerState.media) {
                    _.extend(layer.media, { outTransition: i.additionalLayerState.media['outTransition'] });
                }
                layer.noClear = command._objectParams['noClear'];
            }
            else if (cmdName === 'PauseCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.playing = false;
                layer.pauseTime = Number(command._objectParams['pauseTime']) || _this._currentTimeFunction();
            }
            else if (cmdName === 'ClearCommand') {
                var layer = void 0;
                if (layerNo > 0) {
                    layer = _this.ensureLayer(channel, layerNo);
                    layer.nextUp = null;
                }
                else {
                    channel.layers = {};
                }
                layer = _this.ensureLayer(channel, layerNo);
                layer.playing = false;
                layer.content = api_1.CasparCG.LayerContentType.NOTHING;
                layer.media = null;
                layer.playTime = 0;
                layer.pauseTime = 0;
            }
            else if (cmdName === 'StopCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.playing = false;
                layer.content = api_1.CasparCG.LayerContentType.NOTHING;
                layer.media = null;
                layer.playTime = 0;
                layer.pauseTime = 0;
            }
            else if (cmdName === 'LoadbgCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.nextUp = new api_1.CasparCG.NextUp();
                if (command._objectParams['clip']) {
                    layer.nextUp.content = api_1.CasparCG.LayerContentType.MEDIA;
                    layer.media = new transitionObject_1.TransitionObject(command._objectParams['clip']);
                    if (command._objectParams['transition']) {
                        layer.media.inTransition = new transitionObject_1.Transition(command._objectParams['transition'], +(command._objectParams['transitionDuration'] || 0), command._objectParams['transitionEasing'], command._objectParams['transitionDirection']);
                    }
                    layer.nextUp.looping = !!command._objectParams['loop'];
                }
            }
            else if (cmdName === 'CGAddCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                // Note: we don't support flashLayer for the moment
                if (command._objectParams['templateName']) {
                    layer.content = api_1.CasparCG.LayerContentType.TEMPLATE;
                    layer.media = command._objectParams['templateName'];
                    layer.cgStop = !!command._objectParams['cgStop'];
                    layer.templateType = command._objectParams['templateType'];
                    // layer.playTime = this._currentTimeFunction();
                    if (command._objectParams['playOnLoad']) {
                        layer.playing = true;
                        layer.templateFcn = 'play';
                        layer.templateData = command._objectParams['data'] || null;
                    }
                    else {
                        layer.playing = false;
                        // todo: is data sent to template here also?
                        layer.templateFcn = '';
                        layer.templateData = null;
                    }
                    layer.noClear = command._objectParams['noClear'];
                }
            }
            else if (cmdName === 'PlayHtmlPageCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.content = api_1.CasparCG.LayerContentType.HTMLPAGE;
                layer.media = command._objectParams['url'];
            }
            else if (cmdName === 'CGUpdateCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                if (layer.content === api_1.CasparCG.LayerContentType.TEMPLATE) {
                    layer.templateFcn = 'update';
                    layer.templateData = command._objectParams['data'] || null;
                }
            }
            else if (cmdName === 'CGPlayCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.playing = true;
                layer.templateFcn = 'play';
                layer.templateData = null;
                layer.noClear = command._objectParams['noClear'];
            }
            else if (cmdName === 'CGStopCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.content = api_1.CasparCG.LayerContentType.NOTHING;
                layer.playing = false;
                layer.media = null;
            }
            else if (cmdName === 'CGInvokeCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                if (command._objectParams['method']) {
                    layer.templateFcn = 'invoke';
                    layer.templateData = { method: command._objectParams['method'] };
                }
            }
            else if (cmdName === 'CGRemoveCommand' || cmdName === 'CGClearCommand') {
                // note: since we don't support flashlayers, CGRemoveCommand == CGClearCommand
                var layer = _this.ensureLayer(channel, layerNo);
                // todo: what's the difference between this and StopCommand?
                layer.playing = false;
                layer.content = api_1.CasparCG.LayerContentType.NOTHING;
                layer.media = null;
                // layer.playTime = 0;
                layer.pauseTime = 0;
                layer.templateData = null;
            }
            else if (cmdName === 'PlayDecklinkCommand') {
                var layer = _this.ensureLayer(channel, layerNo);
                layer.content = api_1.CasparCG.LayerContentType.INPUT;
                // layer.media = 'decklink'
                layer.media = new transitionObject_1.TransitionObject('decklink');
                if (command._objectParams['transition']) {
                    layer.media.inTransition = new transitionObject_1.Transition(command._objectParams['transition'], +(command._objectParams['transitionDuration'] || 0), command._objectParams['transitionEasing'], command._objectParams['transitionDirection']);
                }
                if (i.additionalLayerState && i.additionalLayerState.media) {
                    _.extend(layer.media, { outTransition: i.additionalLayerState.media['outTransition'] });
                }
                layer.input = {
                    device: command._objectParams['device'],
                    format: command._objectParams['format']
                };
                layer.playing = true;
                layer.playTime = null; // playtime is irrelevant
                layer.noClear = command._objectParams['noClear'];
            }
            else if (cmdName === 'MixerAnchorCommand') {
                setMixerState(channel, command, 'anchor', ['x', 'y']);
            }
            else if (cmdName === 'MixerBlendCommand') {
                setMixerState(channel, command, 'blend', 'blend');
            }
            else if (cmdName === 'MixerBrightnessCommand') {
                setMixerState(channel, command, 'brightness', 'brightness');
            }
            else if (cmdName === 'MixerChromaCommand') {
                setMixerState(channel, command, 'chroma', ['keyer', 'threshold', 'softness', 'spill']);
            }
            else if (cmdName === 'MixerClipCommand') {
                setMixerState(channel, command, 'clip', ['x', 'y', 'width', 'height']);
            }
            else if (cmdName === 'MixerContrastCommand') {
                setMixerState(channel, command, 'contrast', 'contrast');
            }
            else if (cmdName === 'MixerCropCommand') {
                setMixerState(channel, command, 'crop', ['left', 'top', 'right', 'bottom']);
            }
            else if (cmdName === 'MixerFillCommand') {
                setMixerState(channel, command, 'fill', ['x', 'y', 'xScale', 'yScale']);
                // grid
            }
            else if (cmdName === 'MixerKeyerCommand') {
                setMixerState(channel, command, 'keyer', 'keyer');
            }
            else if (cmdName === 'MixerLevelsCommand') {
                setMixerState(channel, command, 'levels', ['minInput', 'maxInput', 'gamma', 'minOutput', 'maxOutput']);
            }
            else if (cmdName === 'MixerMastervolumeCommand') {
                setMixerState(channel, command, 'mastervolume', 'mastervolume');
                // mipmap
            }
            else if (cmdName === 'MixerOpacityCommand') {
                setMixerState(channel, command, 'opacity', 'opacity');
            }
            else if (cmdName === 'MixerPerspectiveCommand') {
                setMixerState(channel, command, 'perspective', ['topLeftX', 'topLeftY', 'topRightX', 'topRightY', 'bottomRightX', 'bottomRightY', 'bottomLeftX', 'bottomLeftY']);
            }
            else if (cmdName === 'MixerRotationCommand') {
                setMixerState(channel, command, 'rotation', 'rotation');
            }
            else if (cmdName === 'MixerSaturationCommand') {
                setMixerState(channel, command, 'saturation', 'saturation');
            }
            else if (cmdName === 'MixerStraightAlphaOutputCommand') {
                setMixerState(channel, command, 'straightAlpha', 'state');
            }
            else if (cmdName === 'MixerVolumeCommand') {
                setMixerState(channel, command, 'volume', 'volume');
                /*
                    ResumeCommand
    
                    CallCommand
                    SwapCommand
                    AddCommand
                    RemoveCommand
                    SetCommand
                    ChannelGridCommand
    
                    bye
                    kill
                    restart
                */
            }
            else if (cmdName === 'CustomCommand') {
                // specials/temporary workaraounds:
                var customCommand = command._objectParams['customCommand'];
                if (customCommand === 'route') {
                    var layer = _this.ensureLayer(channel, layerNo);
                    layer.content = api_1.CasparCG.LayerContentType.ROUTE;
                    // layer.media = 'route'
                    layer.media = new transitionObject_1.TransitionObject('route');
                    if (command._objectParams['transition']) {
                        layer.media.inTransition = new transitionObject_1.Transition(command._objectParams['transition'], +(command._objectParams['transitionDuration'] || 0), command._objectParams['transitionEasing'], command._objectParams['transitionDirection']);
                    }
                    if (i.additionalLayerState && i.additionalLayerState.media) {
                        _.extend(layer.media, { outTransition: i.additionalLayerState.media['outTransition'] });
                    }
                    var routeChannel = command._objectParams['routeChannel'];
                    var routeLayer = command._objectParams['routeLayer'];
                    layer.route = {
                        channel: parseInt(routeChannel, 10),
                        layer: (routeLayer ? parseInt(routeLayer, 10) : null)
                    };
                    layer.playing = true;
                    layer.playTime = null; // playtime is irrelevant
                }
                else if (customCommand === 'add file') {
                    var layer = _this.ensureLayer(channel, layerNo);
                    layer.content = api_1.CasparCG.LayerContentType.RECORD;
                    layer.media = String(command._objectParams['media']);
                    layer.encoderOptions = String(command._objectParams['encoderOptions'] || '');
                    layer.playing = true;
                    layer.playTime = Number(command._objectParams['playTime']);
                }
                else if (customCommand === 'remove file') {
                    var layer = _this.ensureLayer(channel, layerNo);
                    layer.playing = false;
                    layer.content = api_1.CasparCG.LayerContentType.NOTHING;
                    layer.media = null;
                    delete layer.encoderOptions;
                    // layer.playTime = 0;
                    layer.pauseTime = 0;
                    layer.templateData = null;
                }
            }
            else if (cmdName === 'executeFunction') {
                var layer = _this.ensureLayer(channel, layerNo);
                if (command['returnValue'] !== true) {
                    // save state:
                    layer.content = api_1.CasparCG.LayerContentType.FUNCTION;
                    layer.media = command['media'];
                }
            }
        });
    };
    CasparCGState0.prototype.getDiff = function (newState) {
        // needs to be initialised
        if (!this.isInitialised) {
            throw new Error('CasparCG State is not initialised');
        }
        var currentState = this._currentStateStorage.fetchState();
        return this.diffStates(currentState, newState);
    };
    /** */
    CasparCGState0.prototype.diffStates = function (oldState, newState) {
        var _this = this;
        // needs to be initialised
        if (!this.isInitialised) {
            throw new Error('CasparCG State is not initialised');
        }
        var commands = [];
        var time = this._currentTimeFunction();
        var setTransition = function (options, channel, oldLayer, content, isRemove) {
            if (!options)
                options = {};
            if (_.isObject(content)) {
                var transition = void 0;
                if (isRemove) {
                    if (content.outTransition) {
                        transition = new transitionObject_1.Transition(content.outTransition);
                    }
                }
                else {
                    if (oldLayer.playing && content.changeTransition) {
                        transition = new transitionObject_1.Transition(content.changeTransition);
                    }
                    else if (content.inTransition) {
                        transition = new transitionObject_1.Transition(content.inTransition);
                    }
                }
                if (transition) {
                    options['transition'] = transition.type;
                    options['transitionDuration'] = Math.round(transition.duration * (channel.fps || 50));
                    options['transitionEasing'] = transition.easing;
                    options['transitionDirection'] = transition.direction;
                }
            }
            return options;
        };
        // ==============================================================================
        var setDefaultValue = function (obj, key, value) {
            if (_.isArray(obj)) {
                _.each(obj, function (o) {
                    setDefaultValue(o, key, value);
                });
            }
            else {
                if (_.isArray(key)) {
                    _.each(key, function (k) {
                        setDefaultValue(obj, k, value);
                    });
                }
                else {
                    if (!obj[key])
                        obj[key] = value;
                }
            }
        };
        var bundledCmds = {};
        // Added/updated things:
        _.each(newState.channels, function (newChannel, channelKey) {
            var oldChannel = oldState.channels[channelKey + ''] || (new interfaces_1.CasparCGFull.Channel());
            _.each(newChannel.layers, function (newLayer, layerKey) {
                var oldLayer = oldChannel.layers[layerKey + ''] || (new interfaces_1.CasparCGFull.Layer());
                if (newLayer) {
                    // this.log('diff ' + channelKey + '-' + layerKey, newLayer, oldLayer)
                    /*
                    console.log('newLayer '+channelKey+'-'+layerKey);
                    console.log(newLayer)
                    console.log('old layer');
                    console.log(oldLayer)
                    */
                    var cmd = void 0;
                    var additionalCmds_1 = [];
                    var diff = _this.compareAttrs(newLayer, oldLayer, ['content']);
                    if (!diff) {
                        if (newLayer.content === api_1.CasparCG.LayerContentType.MEDIA) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            setDefaultValue([nl, ol], ['seek', 'pauseTime'], 0);
                            setDefaultValue([nl, ol], ['looping', 'playing'], false);
                            diff = _this.compareAttrs(nl, ol, ['media', 'playTie', 'looping', 'seek', 'pauseTime', 'playing']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.TEMPLATE) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            setDefaultValue([nl, ol], ['templateType'], '');
                            diff = _this.compareAttrs(nl, ol, ['media', 'templateType']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.HTMLPAGE) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            setDefaultValue([nl, ol], ['media'], '');
                            diff = _this.compareAttrs(nl, ol, ['media']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.INPUT) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            diff = _this.compareAttrs(nl, ol, ['media']);
                            setDefaultValue([nl.input, ol.input], ['device', 'format'], '');
                            if (!diff)
                                diff = _this.compareAttrs(nl.input, ol.input, ['device', 'format']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.ROUTE) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            setDefaultValue([nl.route, ol.route], ['channel', 'layer'], 0);
                            diff = _this.compareAttrs(nl.route, ol.route, ['channel', 'layer']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.RECORD) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            setDefaultValue([nl, ol], ['encoderOptions'], '');
                            diff = _this.compareAttrs(nl, ol, ['media', 'playTime', 'encoderOptions']);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.FUNCTION) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            diff = _this.compareAttrs(nl, ol, ['media']);
                        }
                    }
                    if (diff) {
                        // Added things:
                        _this.log('ADD: ' + newLayer.content + ' | ' + diff);
                        var options = {
                            channel: newChannel.channelNo,
                            layer: newLayer.layerNo,
                            noClear: !!newLayer.noClear
                        };
                        setTransition(options, newChannel, oldLayer, newLayer.media, false);
                        if (newLayer.content === api_1.CasparCG.LayerContentType.MEDIA && newLayer.media !== null) {
                            var nl = newLayer;
                            var ol = oldLayer;
                            var getTimeSincePlay = function (layer) {
                                var timeSincePlay = (layer.pauseTime || time) - (layer.playTime || 0);
                                if (timeSincePlay < _this.minTimeSincePlay) {
                                    timeSincePlay = 0;
                                }
                                if (layer.looping) {
                                    // we don't support looping and seeking at the same time right now..
                                    timeSincePlay = 0;
                                }
                                if (_.isNull(layer.playTime)) {
                                    timeSincePlay = null;
                                }
                                return timeSincePlay;
                            };
                            var getSeek = function (layer, timeSincePlay) {
                                return Math.max(0, Math.floor(((timeSincePlay || 0)
                                    +
                                        (layer.seek || 0))
                                    * (newChannel.fps || oldChannel.fps)));
                            };
                            var timeSincePlay = getTimeSincePlay(nl);
                            var seek = getSeek(nl, timeSincePlay);
                            if (nl.playing) {
                                nl.pauseTime = 0;
                                var oldTimeSincePlay = getTimeSincePlay(ol);
                                var oldSeek = getSeek(ol, oldTimeSincePlay);
                                if (!_this.compareAttrs(nl, ol, ['media']) &&
                                    ol.pauseTime &&
                                    Math.abs(oldSeek - seek) < _this.minTimeSincePlay) {
                                    cmd = new casparcg_connection_1.AMCP.PlayCommand(options);
                                }
                                else {
                                    cmd = new casparcg_connection_1.AMCP.PlayCommand(_.extend(options, {
                                        clip: (nl.media || '').toString(),
                                        seek: seek,
                                        loop: !!nl.looping
                                    }));
                                }
                            }
                            else {
                                if (((nl.pauseTime && (time - nl.pauseTime) < _this.minTimeSincePlay) ||
                                    _.isNull(timeSincePlay)) &&
                                    !_this.compareAttrs(nl, ol, ['media'])) {
                                    cmd = new casparcg_connection_1.AMCP.PauseCommand(_.extend(options, {
                                        pauseTime: nl.pauseTime
                                    }));
                                }
                                else {
                                    cmd = new casparcg_connection_1.AMCP.LoadCommand(_.extend(options, {
                                        clip: (nl.media || '').toString(),
                                        seek: seek,
                                        loop: !!nl.looping,
                                        pauseTime: nl.pauseTime
                                    }));
                                }
                            }
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.TEMPLATE && newLayer.media !== null) {
                            var nl = newLayer;
                            // let ol: CF.ITemplateLayer = oldLayer as CF.ITemplateLayer
                            cmd = new casparcg_connection_1.AMCP.CGAddCommand(_.extend(options, {
                                templateName: (nl.media || '').toString(),
                                flashLayer: 1,
                                playOnLoad: nl.playing,
                                data: nl.templateData || undefined,
                                cgStop: nl.cgStop,
                                templateType: nl.templateType
                            }));
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.HTMLPAGE && newLayer.media !== null) {
                            var nl = newLayer;
                            // let ol: CF.ITemplateLayer = oldLayer as CF.ITemplateLayer
                            cmd = new casparcg_connection_1.AMCP.PlayHtmlPageCommand(_.extend(options, {
                                url: (nl.media || '').toString()
                            }));
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.INPUT && newLayer.media !== null) {
                            var nl = newLayer;
                            // let ol: CF.IInputLayer = oldLayer as CF.IInputLayer
                            var inputType = (nl.input && nl.media && (nl.media || '').toString()) || 'decklink';
                            var device = (nl.input && nl.input.device);
                            var format = (nl.input && nl.input.format) || null;
                            var channelLayout = (nl.input && nl.input.channelLayout) || null;
                            if (inputType === 'decklink') {
                                _.extend(options, {
                                    device: device,
                                    format: format,
                                    channelLayout: channelLayout
                                });
                                cmd = new casparcg_connection_1.AMCP.PlayDecklinkCommand(options);
                            }
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.ROUTE) {
                            var nl = newLayer;
                            // let ol: CF.IRouteLayer = oldLayer as CF.IRouteLayer
                            if (nl.route) {
                                var routeChannel = nl.route.channel;
                                var routeLayer = nl.route.layer || null;
                                _.extend(options, {
                                    routeChannel: routeChannel,
                                    routeLayer: routeLayer,
                                    command: ('PLAY ' + options.channel + '-' + options.layer +
                                        ' route://' +
                                        routeChannel +
                                        (routeLayer ? '-' + routeLayer : '') +
                                        (options['transition']
                                            ? (' ' + options['transition'] + ' ' + options['transitionDuration'] + ' ' + options['transitionEasing'])
                                            : '')),
                                    customCommand: 'route'
                                });
                                cmd = new casparcg_connection_1.AMCP.CustomCommand(options);
                            }
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.RECORD && newLayer.media !== null) {
                            var nl = newLayer;
                            // let ol: CF.IRecordLayer = oldLayer as CF.IRecordLayer
                            var media = nl.media;
                            var encoderOptions = nl.encoderOptions || '';
                            var playTime = nl.playTime;
                            _.extend(options, {
                                media: media,
                                encoderOptions: encoderOptions,
                                playTime: playTime,
                                command: ('ADD ' + options.channel + ' FILE ' + media + ' ' + encoderOptions),
                                customCommand: 'add file'
                            });
                            cmd = new casparcg_connection_1.AMCP.CustomCommand(options);
                        }
                        else if (newLayer.content === api_1.CasparCG.LayerContentType.FUNCTION) {
                            var nl = newLayer;
                            // let ol: CF.IFunctionLayer = oldLayer as CF.IFunctionLayer
                            if (nl.media && nl.executeFcn) {
                                cmd = {
                                    channel: options.channel,
                                    layer: options.layer,
                                    _commandName: 'executeFunction',
                                    media: nl.media,
                                    externalFunction: true
                                };
                                if (nl.executeFcn === 'special_osc') {
                                    cmd = _.extend(cmd, {
                                        specialFunction: 'osc',
                                        oscDevice: nl.oscDevice,
                                        message: nl.inMessage
                                    });
                                }
                                else {
                                    cmd = _.extend(cmd, {
                                        functionName: nl.executeFcn,
                                        functionData: nl.executeData,
                                        functionLayer: nl
                                    });
                                }
                            }
                        }
                        else {
                            // @todo: When does this happen? Do we need this? /Johan
                            if (oldLayer.content === api_1.CasparCG.LayerContentType.MEDIA) {
                                cmd = new casparcg_connection_1.AMCP.StopCommand(options);
                            }
                        }
                    }
                    else if (newLayer.content === api_1.CasparCG.LayerContentType.TEMPLATE) {
                        var nl = newLayer;
                        var ol = oldLayer;
                        diff = _this.compareAttrs(nl, ol, ['templateData']);
                        if (diff) {
                            // Updated things:
                            _this.log('UPDATE: ' + nl.content + ' ' + diff);
                            var options = {};
                            options.channel = newChannel.channelNo;
                            options.layer = nl.layerNo;
                            if (nl.content === api_1.CasparCG.LayerContentType.TEMPLATE) {
                                cmd = new casparcg_connection_1.AMCP.CGUpdateCommand(_.extend(options, {
                                    flashLayer: 1,
                                    data: nl.templateData || undefined
                                }));
                            }
                        }
                    }
                    // -------------------------------------------------------------
                    // Mixer commands:
                    if (!newLayer.mixer)
                        newLayer.mixer = new mixer_1.Mixer();
                    if (!oldLayer.mixer)
                        oldLayer.mixer = new mixer_1.Mixer();
                    var compareMixerValues_1 = function (layer, oldLayer, attr, attrs) {
                        var val0 = mixer_1.Mixer.getValue((layer.mixer || {})[attr]);
                        var val1 = mixer_1.Mixer.getValue((oldLayer.mixer || {})[attr]);
                        if (attrs) {
                            var areSame_1 = true;
                            if (val0 && val1) {
                                _.each(attrs, function (a) {
                                    if (val0[a] !== val1[a])
                                        areSame_1 = false;
                                });
                            }
                            else {
                                if ((val0 && !val1)
                                    ||
                                        (!val0 && val1)) {
                                    areSame_1 = false;
                                }
                            }
                            return areSame_1;
                        }
                        else if (_.isObject(val0) || _.isObject(val1)) {
                            // @todo is this used anymore?
                            if (_.isObject(val0) && _.isObject(val1)) {
                                var omitAttrs = ['inTransition', 'changeTransition', 'outTransition'];
                                return _.isEqual(_.omit(val0, omitAttrs), _.omit(val1, omitAttrs));
                            }
                            else
                                return false;
                        }
                        else {
                            return (val0 === val1);
                        }
                    };
                    var pushMixerCommand = function (attr, Command, subValue) {
                        if (!compareMixerValues_1(newLayer, oldLayer, attr, (_.isArray(subValue)
                            ? subValue
                            : undefined))) {
                            // this.log('pushMixerCommand change: ' + attr)
                            // this.log(oldLayer.mixer, newLayer.mixer)
                            // this.log(Mixer.getValue(oldLayer.mixer[attr]), Mixer.getValue(newLayer.mixer[attr]))
                            var options_1 = {};
                            options_1.channel = newChannel.channelNo;
                            options_1.layer = newLayer.layerNo;
                            var o_2 = mixer_1.Mixer.getValue((newLayer.mixer || {})[attr]);
                            if (newLayer.mixer && _.has(newLayer.mixer, attr) && !_.isUndefined(o_2)) {
                                setTransition(options_1, newChannel, oldLayer, newLayer.mixer, false);
                                if (_.isArray(subValue)) {
                                    _.each(subValue, function (sv) {
                                        options_1[sv] = o_2[sv];
                                    });
                                }
                                else if (_.isString(subValue)) {
                                    if (_.isObject(o_2)) {
                                        options_1[subValue] = o_2._value;
                                    }
                                    else {
                                        options_1[subValue] = o_2;
                                    }
                                }
                                if (newLayer.mixer.bundleWithCommands) {
                                    options_1['bundleWithCommands'] = newLayer.mixer.bundleWithCommands;
                                    var key = newLayer.mixer.bundleWithCommands + '';
                                    if (!bundledCmds[key])
                                        bundledCmds[key] = [];
                                    options_1['defer'] = true;
                                    bundledCmds[key].push(new Command(options_1));
                                }
                                else {
                                    additionalCmds_1.push(new Command(options_1));
                                }
                            }
                            else {
                                // use default values
                                setTransition(options_1, newChannel, oldLayer, newLayer.mixer, true);
                                var defaultValue = mixer_1.Mixer.getDefaultValues(attr);
                                if (_.isObject(defaultValue)) {
                                    _.extend(options_1, defaultValue);
                                }
                                else {
                                    options_1[attr] = defaultValue;
                                }
                                options_1._defaultOptions = true; // this is used in ApplyCommands to set state to "default", and not use the mixer values
                                additionalCmds_1.push(new Command(options_1));
                            }
                        }
                    };
                    pushMixerCommand('anchor', casparcg_connection_1.AMCP.MixerAnchorCommand, ['x', 'y']);
                    pushMixerCommand('blend', casparcg_connection_1.AMCP.MixerBlendCommand, 'blend');
                    pushMixerCommand('brightness', casparcg_connection_1.AMCP.MixerBrightnessCommand, 'brightness');
                    pushMixerCommand('chroma', casparcg_connection_1.AMCP.MixerChromaCommand, ['keyer', 'threshold', 'softness', 'spill']);
                    pushMixerCommand('clip', casparcg_connection_1.AMCP.MixerClipCommand, ['x', 'y', 'width', 'height']);
                    pushMixerCommand('contrast', casparcg_connection_1.AMCP.MixerContrastCommand, 'contrast');
                    pushMixerCommand('crop', casparcg_connection_1.AMCP.MixerCropCommand, ['left', 'top', 'right', 'bottom']);
                    pushMixerCommand('fill', casparcg_connection_1.AMCP.MixerFillCommand, ['x', 'y', 'xScale', 'yScale']);
                    // grid
                    pushMixerCommand('keyer', casparcg_connection_1.AMCP.MixerKeyerCommand, 'keyer');
                    pushMixerCommand('levels', casparcg_connection_1.AMCP.MixerLevelsCommand, ['minInput', 'maxInput', 'gamma', 'minOutput', 'maxOutput']);
                    if (newLayer.layerNo === -1)
                        pushMixerCommand('mastervolume', casparcg_connection_1.AMCP.MixerMastervolumeCommand, 'mastervolume');
                    // mipmap
                    pushMixerCommand('opacity', casparcg_connection_1.AMCP.MixerOpacityCommand, 'opacity');
                    pushMixerCommand('perspective', casparcg_connection_1.AMCP.MixerPerspectiveCommand, ['topLeftX', 'topLeftY', 'topRightX', 'topRightY', 'bottomRightX', 'bottomRightY', 'bottomLeftX', 'bottomLeftY']);
                    pushMixerCommand('rotation', casparcg_connection_1.AMCP.MixerRotationCommand, 'rotation');
                    pushMixerCommand('saturation', casparcg_connection_1.AMCP.MixerSaturationCommand, 'saturation');
                    if (newLayer.layerNo === -1)
                        pushMixerCommand('straightAlpha', casparcg_connection_1.AMCP.MixerStraightAlphaOutputCommand, 'state');
                    pushMixerCommand('volume', casparcg_connection_1.AMCP.MixerVolumeCommand, 'volume');
                    var cmds_1 = [];
                    if (cmd) {
                        if (cmd['serialize']) {
                            cmds_1.push(cmd['serialize']());
                        }
                        else {
                            cmds_1.push(cmd);
                        }
                    }
                    _.each(additionalCmds_1, function (addCmd) {
                        cmds_1.push(addCmd.serialize());
                    });
                    commands.push({ cmds: cmds_1, additionalLayerState: newLayer });
                }
            });
        });
        // ==============================================================================
        // Removed things:
        _.each(oldState.channels, function (oldChannel, channelKey) {
            var newChannel = newState.channels[channelKey] || (new interfaces_1.CasparCGFull.Channel());
            _.each(oldChannel.layers, function (oldLayer, layerKey) {
                var newLayer = newChannel.layers[layerKey + ''] || (new api_1.CasparCG.ILayerBase());
                if (newLayer) {
                    if (!newLayer.content && oldLayer.content) {
                        _this.log('REMOVE ' + channelKey + '-' + layerKey + ': ' + oldLayer.content + ' | ' + newLayer.content);
                        _this.log(oldLayer);
                        if (oldLayer.noClear) {
                            // hack: don't do the clear command:
                            _this.log('NOCLEAR is set!');
                        }
                        else {
                            var noCommand = false;
                            var cmd = null;
                            if (oldLayer.content === api_1.CasparCG.LayerContentType.RECORD) {
                                cmd = new casparcg_connection_1.AMCP.CustomCommand({
                                    layer: oldLayer.layerNo,
                                    channel: oldChannel.channelNo,
                                    command: ('REMOVE ' + oldChannel.channelNo + ' FILE'),
                                    customCommand: 'remove file'
                                });
                            }
                            else if (typeof oldLayer.media === 'object' && oldLayer.media !== null) {
                                if (oldLayer.media.outTransition) {
                                    cmd = new casparcg_connection_1.AMCP.PlayCommand({
                                        channel: oldChannel.channelNo,
                                        layer: oldLayer.layerNo,
                                        clip: 'empty',
                                        transition: oldLayer.media.outTransition.type,
                                        transitionDuration: Math.round(+(oldLayer.media.outTransition.duration) * oldChannel.fps),
                                        transitionEasing: oldLayer.media.outTransition.easing,
                                        transitionDirection: oldLayer.media.outTransition.direction
                                    });
                                }
                            }
                            if (!cmd) {
                                if (oldLayer.content === api_1.CasparCG.LayerContentType.TEMPLATE) {
                                    var ol = oldLayer;
                                    if (ol.cgStop) {
                                        cmd = new casparcg_connection_1.AMCP.CGStopCommand({
                                            channel: oldChannel.channelNo,
                                            layer: oldLayer.layerNo,
                                            flashLayer: 1
                                        });
                                    }
                                }
                            }
                            if (oldLayer.content === api_1.CasparCG.LayerContentType.FUNCTION) {
                                // Functions only trigger action when they start, no action on end
                                // send nothing
                                noCommand = true;
                            }
                            else if (oldLayer.content === api_1.CasparCG.LayerContentType.MEDIA &&
                                oldLayer.media &&
                                oldLayer.media.valueOf() + '' === 'empty') {
                                // the old layer is an empty, thats essentially something that is cleared
                                // (or an out transition)
                                // send nothing then
                                noCommand = true;
                            }
                            if (!noCommand) {
                                if (!cmd) {
                                    // ClearCommand:
                                    cmd = new casparcg_connection_1.AMCP.ClearCommand({
                                        channel: oldChannel.channelNo,
                                        layer: oldLayer.layerNo
                                    });
                                }
                                if (cmd) {
                                    commands.push({
                                        cmds: [
                                            cmd.serialize()
                                        ]
                                    });
                                }
                            }
                        }
                    }
                }
            });
        });
        // bundled commands:
        _.each(bundledCmds, function (bundle) {
            var channels = _.uniq(_.pluck(bundle, 'channel'));
            _.each(channels, function (channel) {
                bundle.push(new casparcg_connection_1.AMCP.MixerCommitCommand({
                    channel: Number(channel)
                }));
            });
            var cmds = [];
            _.each(bundle, function (cmd) {
                cmds.push(cmd.serialize());
            });
            commands.push({ cmds: cmds });
        });
        return commands;
    };
    CasparCGState0.prototype.valueOf = function () {
        return this.getState();
    };
    CasparCGState0.prototype.toString = function () {
        return JSON.stringify(this.getState());
    };
    Object.defineProperty(CasparCGState0.prototype, "isInitialised", {
        /** */
        get: function () {
            return this._isInitialised;
        },
        /** */
        set: function (initialised) {
            if (this._isInitialised !== initialised) {
                this._isInitialised = initialised;
                if (this._isInitialised) {
                    this.applyCommands(this.bufferedCommands);
                    this.bufferedCommands = [];
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    // /**
    //  * Apply attributes to a the state
    //  * @param channelNo Channel number
    //  * @param layerNo Layer number
    //  * @param stateData
    //  */
    // private _applyState (channelNo: number, layerNo: number, stateData: {[key: string]: any}): void {
    // 	let state = this.getState()
    // 	let channel: CF.Channel | undefined = _.find(state.channels, (channel) => {
    // 		return channel.channelNo === channelNo
    // 	})
    // 	if (channel) {
    // 		let layer: CF.Layer | undefined = _.find(channel.layers, (layer) => {
    // 			return layer.layerNo === layerNo
    // 		})
    // 		if (layer) {
    // 			_.extend(layer, stateData)
    // 		}
    // 	}
    // }
    CasparCGState0.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._externalLog) {
            this._externalLog.apply(this, args);
        }
        else {
            console.log.apply(console, args);
        }
    };
    /** */
    CasparCGState0.prototype.ensureLayer = function (channel, layerNo) {
        if (!(layerNo > 0 || layerNo === -1)) {
            throw new Error("State.ensureLayer: tried to get layer '" + layerNo + "' on channel '" + channel + "'");
        }
        var layer = channel.layers[layerNo + ''];
        if (!layer) {
            layer = new interfaces_1.CasparCGFull.Layer();
            layer.layerNo = layerNo;
            channel.layers[layer.layerNo + ''] = layer;
        }
        return layer;
    };
    CasparCGState0.prototype.compareAttrs = function (obj0, obj1, attrs, strict) {
        var _this = this;
        var difference = null;
        var diff0 = '';
        var diff1 = '';
        var getValue = function (val) {
            return mixer_1.Mixer.getValue(val);
        };
        var cmp = function (a, b, name) {
            if (name === 'playTime') {
                return Math.abs(a - b) > _this.minTimeSincePlay;
            }
            else {
                return a !== b;
            }
        };
        if (obj0 && obj1) {
            if (strict) {
                _.each(attrs, function (a) {
                    if (obj0[a].valueOf() !== obj1[a].valueOf()) {
                        diff0 = obj0[a].valueOf() + '';
                        diff1 = obj1[a].valueOf() + '';
                        if (diff0 && diff0.length > 20)
                            diff0 = diff0.slice(0, 20) + '...';
                        if (diff1 && diff1.length > 20)
                            diff1 = diff1.slice(0, 20) + '...';
                        difference = a + ': ' + diff0 + '!==' + diff1;
                    }
                });
            }
            else {
                _.each(attrs, function (a) {
                    if (cmp(getValue(obj0[a]), getValue(obj1[a]), a)) {
                        diff0 = getValue(obj0[a]) + '';
                        diff1 = getValue(obj1[a]) + '';
                        if (diff0 && diff0.length > 20)
                            diff0 = diff0.slice(0, 20) + '...';
                        if (diff1 && diff1.length > 20)
                            diff1 = diff1.slice(0, 20) + '...';
                        difference = a + ': ' + diff0 + '!=' + diff1;
                    }
                });
            }
        }
        else {
            if ((obj0 && !obj1)
                ||
                    (!obj0 && obj1))
                difference = '' + (!!obj0) + ' t/f ' + (!!obj1);
        }
        return difference;
    };
    return CasparCGState0;
}());
exports.CasparCGState0 = CasparCGState0;
var CasparCGState = /** @class */ (function (_super) {
    tslib_1.__extends(CasparCGState, _super);
    function CasparCGState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Set the current state to provided state
     * @param state The new state
     */
    CasparCGState.prototype.setState = function (state) {
        _super.prototype.setState.call(this, clone(state));
    };
    /**
     * Get the gurrent state
     * @param  {true}}   options [description]
     * @return {CF.State} The current state
     */
    CasparCGState.prototype.getState = function () {
        return clone(_super.prototype.getState.call(this));
    };
    return CasparCGState;
}(CasparCGState0));
exports.CasparCGState = CasparCGState;
//# sourceMappingURL=casparCGState.js.map