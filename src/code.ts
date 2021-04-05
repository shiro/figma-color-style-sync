import {IColorMapping, syncColors} from "./styleUtil";
import {FigmaMessage, FigmaMessageEvent, postToUI, UIMessage} from "src/utils/figmaCommunication";
import objectAssignDeep from "object-assign-deep";
import {formatMapping} from "src/utils/colorMapping";

figma.showUI(__html__, {
    height: 400,
    width: 300,
});


const readState = () => {
    try {
        const rawState = figma.root.getSharedPluginData('linkedStyles', 'colors');
        const state: IColorMapping = JSON.parse(rawState);
        return state || {};
    } catch (e) {
        console.error("failed to read component state", e);
    }
}

const writeState = (mapping: IColorMapping) => {
    figma.root.setSharedPluginData('linkedStyles', 'colors', JSON.stringify(mapping));
}

const updateMapping = (_mapping: IColorMapping) => {
    mapping = _mapping;
    writeState(mapping);
}


let timeout;
let syncActive = false;

let mapping: IColorMapping = readState();
let colorPaletteRegex = new RegExp("colors/.*");


const getFigmaColorStyles = () => figma
    .getLocalPaintStyles()
    .filter((style) => style.paints.length == 1)
    .filter(style => style.paints[0].type == "SOLID");

const syncStyles = async () => {
    const styleMap = getFigmaColorStyles()
        .reduce((acc, style) => {
            return {...acc, [style.name]: style};
        }, {});

    await syncColors(styleMap, mapping);

    if (syncActive) scheduleSync();
}

const linkStyles = () => {
    const styles = getFigmaColorStyles();
    let paletteStyles: [string, string][] = []; // [name, color]
    let otherStyles: Record<string, string[]> = {}; // color => style names

    const colorToString = (color: { r: number, g: number, b: number }) => `${color.r},${color.g},${color.b}`;

    for (const style of styles) {
        const colorPaint = style.paints[0] as SolidPaint;
        const colorString = colorToString(colorPaint.color);

        if (colorPaletteRegex.test(style.name)) {
            paletteStyles.push([style.name, colorString]);
        } else {
            if (!otherStyles[colorString]) otherStyles[colorString] = [];
            otherStyles[colorString].push(style.name);
        }
    }

    const newMapping = objectAssignDeep({}, mapping);

    for (const [fromStyleName, colorString] of paletteStyles) {
        const toStyleNames = otherStyles[colorString];
        if (!toStyleNames) continue;

        for (const toStyleName of toStyleNames) {
            if (typeof newMapping[fromStyleName] == "string") {
                if (newMapping[fromStyleName] == toStyleName) continue;
                newMapping[fromStyleName] = [(newMapping[fromStyleName] as string), toStyleName];
            } else if (Array.isArray(newMapping[fromStyleName])) {
                if (newMapping[fromStyleName].includes(toStyleName)) continue; // already have it
                (newMapping[fromStyleName] as string[]).push(toStyleName);
            } else {
                newMapping[fromStyleName] = toStyleName;
            }
        }
    }

    return newMapping;
}

const scheduleSync = () => {
    timeout = setTimeout(syncStyles, 1000);
}

const startSync = async () => {
    syncActive = true;
    await syncStyles();
}

const stopSync = () => {
    syncActive = false;
    clearTimeout(timeout);
}

figma.on("close", () => {
    stopSync();
});


figma.ui.onmessage = (msg: FigmaMessageEvent) => {
    if (!msg) return;

    switch (msg.type) {
        case FigmaMessage.INIT: {
            postToUI({type: UIMessage.UPDATE_MAPPING, mapping});
            return;
        }
        case FigmaMessage.TOGGLE_SYNC: {
            console.log("start")
            if (syncActive) {
                stopSync();
            } else {
                startSync();
            }
            return;
        }
        case FigmaMessage.UPDATE_MAPPING: {
            const {mapping} = msg;
            updateMapping(mapping);
            return;
        }
        case FigmaMessage.LINK_STYLES: {
            let newMapping = linkStyles();
            newMapping = formatMapping(newMapping);
            postToUI({type: UIMessage.UPDATE_MAPPING, mapping: newMapping});
            return;
        }
    }
};
