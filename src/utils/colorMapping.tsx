import {IColorMapping} from "src/styleUtil";
import objectAssignDeep from "object-assign-deep";

export const formatMapping = (mapping : IColorMapping) => {
    const newMapping = objectAssignDeep({}, mapping);

    for (const [fromName, to] of Object.entries(newMapping)) {
        if (Array.isArray(to)){
            newMapping[fromName] = to.sort();
        }
    }

    return newMapping;
}