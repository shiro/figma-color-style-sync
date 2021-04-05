// import {figmaRGBToHex} from "@figma-plugin/helpers/dist/helpers/convertColor.js";
import { figmaRGBToHex } from "@figma-plugin/helpers";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// interface ITarget {
//     value: string;
//     description?: string;
//     paints: Paint[];
// }
//
// interface IToken {
//     value: string;
//     description?: string;
// }
// const setColorValuesOnTarget = (target :ITarget, token: IToken) => {
//     try {
//         const {description, value} = token;
//         if (value.startsWith('linear-gradient')) {
//             const {gradientStops, gradientTransform} = convertStringToFigmaGradient(value);
//             const newPaint : GradientPaint = {
//                 type: 'GRADIENT_LINEAR',
//                 gradientTransform,
//                 gradientStops,
//             };
//             target.paints = [newPaint];
//         } else {
//             const {color, opacity} = convertToFigmaColor(value);
//             target.paints = [{color, opacity, type: 'SOLID'}];
//         }
//
//         if (description) {
//             target.description = description;
//         }
//     } catch (e) {
//         console.error('Error setting color', e);
//     }
// };
const foo = () => {
    const colors = figma
        .getLocalPaintStyles()
        .filter((style) => style.paints.length === 1)
        .map((style) => {
        const paint = style.paints[0];
        let styleObject = {};
        if (style.description) {
            styleObject.description = style.description;
        }
        if (paint.type === 'SOLID') {
            const { r, g, b } = paint.color;
            const a = paint.opacity;
            styleObject.value = figmaRGBToHex({ r, g, b, a });
        }
        else if (paint.type === 'GRADIENT_LINEAR') {
            // styleObject.value = convertFigmaGradientToString(paint);
        }
        else {
            styleObject = null;
        }
        const normalizedName = style.name
            .split('/')
            .map((section) => section.trim())
            .join('/');
        return styleObject ? [normalizedName, styleObject] : null;
    })
        .filter(Boolean);
    // console.log("colors", colors);
};
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // const styles = figma.getLocalPaintStyles()
    //     .filter(s => s.type == "PAINT");
    // console.log("styles", styles);
    foo();
    // const token: IToken = {value: "#f00"};
    // setColorValuesOnTarget(, token);
    // return;
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-rectangles') {
        const nodes = [];
        for (let i = 0; i < msg.count; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
