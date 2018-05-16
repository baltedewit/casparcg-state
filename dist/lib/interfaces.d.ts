import { CasparCG } from './api';
export declare namespace CasparCGFull {
    class State extends CasparCG.State {
        channels: {
            [channel: string]: Channel;
        };
    }
    class Channel extends CasparCG.Channel {
        channelNo: number;
        videoMode: string | null;
        fps: number;
        layers: {
            [layer: string]: Layer;
        };
    }
    class Layer extends CasparCG.ILayerBase {
    }
    interface IMediaLayer extends CasparCG.IMediaLayer {
    }
    interface ITemplateLayer extends CasparCG.ITemplateLayer {
    }
    interface IInputLayer extends CasparCG.IInputLayer {
    }
    interface IRouteLayer extends CasparCG.IRouteLayer {
    }
    interface IRecordLayer extends CasparCG.IRecordLayer {
    }
    interface IFunctionLayer extends CasparCG.IFunctionLayer {
    }
    interface IEmptyLayer extends CasparCG.IEmptyLayer {
    }
}
