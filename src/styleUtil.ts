export interface IStyleMap {
    [p: string]: PaintStyle;
}

export interface IColorMapping {
    [fromName: string]: string | string[];
}

export const syncColors = async (styles: IStyleMap, mappings: IColorMapping) => {
    for (let [fromName, toNames] of Object.entries(mappings)) {
        if (!Array.isArray(toNames)) toNames = [toNames];

        const fromStyle = styles[fromName];
        if (!fromStyle) continue;

        for (const toName of toNames) {
            let toStyle = styles[toName];

            if (!toStyle) {
                toStyle = figma.createPaintStyle();
                toStyle.name = toName;

                const newPaint: Paint = {
                    type: "SOLID",
                    color: {...(fromStyle.paints[0] as SolidPaint).color},
                };
                toStyle.paints = [newPaint];
                continue;
            }

            const c1 = (fromStyle.paints[0] as SolidPaint).color;
            const c2 = (toStyle.paints[0] as SolidPaint).color;

            if (c1.r == c2.r && c1.g == c2.g && c1.b == c2.b) continue;

            toStyle.paints = fromStyle.paints;
        }
    }
}