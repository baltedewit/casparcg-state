import { TransitionObject as TransitionObject0, Transition as Transition0 } from './transitionObject';
import { Mixer as Mixer0 } from './mixer';
export declare namespace CasparCG {
    class Mappings {
        layers: {
            [GLayer: string]: Mapping;
        };
    }
    class Mapping {
        channel: number;
        layer: number;
    }
    class State {
        channels: {
            [channel: string]: Channel;
        };
    }
    class ChannelInfo {
        videoMode?: string | null;
        fps?: number;
    }
    class Channel extends ChannelInfo {
        channelNo: number;
        layers: {
            [layer: string]: ILayerBase;
        };
    }
    class ILayerBase {
        layerNo: number;
        content: LayerContentType;
        media?: string | TransitionObject0 | null;
        looping?: boolean;
        playTime?: number | null;
        duration?: number;
        noClear?: boolean;
        playing?: boolean;
        mixer?: Mixer0;
    }
    class NextUp extends ILayerBase {
        auto: boolean;
    }
    interface IMediaLayer extends ILayerBase {
        content: LayerContentType.MEDIA;
        media: string | TransitionObject0 | null;
        playTime: number | null;
        playing: boolean;
        looping?: boolean;
        seek?: number;
        pauseTime?: number | null;
        nextUp?: NextUp | null;
    }
    interface ITemplateLayer extends ILayerBase {
        content: LayerContentType.TEMPLATE;
        media: string | TransitionObject0 | null;
        playTime: number | null;
        playing: boolean;
        templateType?: 'flash' | 'html';
        templateFcn?: string;
        templateData?: Object | string | null;
        cgStop?: boolean;
        nextUp?: NextUp | null;
    }
    interface IHtmlPageLayer extends ILayerBase {
        content: LayerContentType.HTMLPAGE;
        media: string | TransitionObject0 | null;
        playTime: number | null;
        playing: true;
        nextUp?: NextUp | null;
    }
    interface IInputLayer extends ILayerBase {
        content: LayerContentType.INPUT;
        media: 'decklink' | TransitionObject0;
        input: {
            device: number;
            format?: string;
            channelLayout?: string;
        };
        playing: true;
        playTime: null;
    }
    interface IRouteLayer extends ILayerBase {
        content: LayerContentType.ROUTE;
        media: 'route' | TransitionObject0;
        route: {
            channel: number;
            layer?: number | null;
        } | null;
        playing: true;
        playTime: null;
    }
    interface IRecordLayer extends ILayerBase {
        content: LayerContentType.RECORD;
        encoderOptions: string;
        playing: true;
        playTime: number;
    }
    interface IFunctionLayer extends ILayerBase {
        content: LayerContentType.FUNCTION;
        executeFcn?: string;
        executeData?: any;
        oscDevice?: number;
        inMessage?: {
            url: string;
            args?: {};
        } | null;
        outMessage?: {
            url: string;
            args?: {};
        } | null;
    }
    interface IEmptyLayer extends ILayerBase {
        content: LayerContentType.NOTHING;
        playing: false;
        pauseTime: 0;
        nextUp?: NextUp | null;
        templateData?: Object | null;
        encoderOptions?: string;
    }
    enum LayerContentType {
        NOTHING = "",
        MEDIA = "media",
        TEMPLATE = "template",
        HTMLPAGE = "htmlpage",
        INPUT = "input",
        ROUTE = "route",
        RECORD = "record",
        FUNCTION = "function",
    }
    interface Mixer extends Mixer0 {
    }
    interface ITransition {
        type?: string;
        duration: number;
        easing?: string;
        direction?: string;
    }
    class TransitionObject extends TransitionObject0 {
    }
    class Transition extends Transition0 {
    }
}
