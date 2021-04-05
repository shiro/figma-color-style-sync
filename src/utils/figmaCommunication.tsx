import {IColorMapping} from "src/styleUtil";

export function postToFigma(msg) {
    parent.postMessage(
        {
            pluginMessage: msg,
        },
        '*'
    );
}

export function notifyUI(msg, opts?) {
    figma.notify(msg, opts);
}

export function postToUI(props: UIMessageEvent) {
    figma.ui.postMessage(props);
}


export enum UIMessage {
    INIT,
    UPDATE_MAPPING,
}

export type UIMessageEvent =
    { type: UIMessage.INIT, mapping: IColorMapping } |
    { type: UIMessage.UPDATE_MAPPING, mapping: IColorMapping };

export enum FigmaMessage {
    INIT,
    TOGGLE_SYNC,
    UPDATE_MAPPING,
    LINK_STYLES,
}

export type FigmaMessageEvent =
    { type: FigmaMessage.INIT } |
    { type: FigmaMessage.TOGGLE_SYNC } |
    { type: FigmaMessage.UPDATE_MAPPING, mapping: IColorMapping } |
    { type: FigmaMessage.LINK_STYLES };
