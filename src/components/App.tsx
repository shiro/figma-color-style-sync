import * as React from 'react';
import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import "./index.scss"
import {FigmaMessage, postToFigma, UIMessage, UIMessageEvent} from "src/utils/figmaCommunication";
import css from "./App.module.scss";
import cn from "classnames";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {IColorMapping} from "src/styleUtil";
import {formatMapping} from "src/utils/colorMapping";


const App = () => {
    const [mapping, setMapping] = useState<string>("");
    const [inputError, setInputError] = useState<string | null>(null);
    const [isSyncActive, setIsSyncActive] = useState(false);

    useEffect(() => {
        window.onmessage = async (event) => {
            const msg = event.data.pluginMessage as UIMessageEvent;

            switch (msg.type) {
                case UIMessage.INIT: {
                    setMapping(JSON.stringify(msg.mapping, null, 2));
                    return;
                }
                case UIMessage.UPDATE_MAPPING: {
                    setMapping(JSON.stringify(msg.mapping, null, 2));
                    return;
                }
            }
        };
    }, []);

    useEffect(() => {
        postToFigma({type: UIMessage.INIT});
    }, []);


    const handleToggleSyncClick = () => {
        postToFigma({type: FigmaMessage.TOGGLE_SYNC});
        setIsSyncActive(!isSyncActive);
    };

    const handleLinkStylesClick = () => {
        postToFigma({type: FigmaMessage.LINK_STYLES});
    };

    const handleMappingSaveClick = () => {
        try {
            let parsedMapping: IColorMapping = JSON.parse(mapping);
            parsedMapping = formatMapping(parsedMapping);
            postToFigma({type: FigmaMessage.UPDATE_MAPPING, mapping: parsedMapping});
            setMapping(JSON.stringify(parsedMapping, null, 2));
        } catch (e) {
            console.error("JSON parse failed", e);
            setInputError(e.message);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMapping(e.target.value);
        setInputError(null);
    };

    return <div>
        <button className="button button--primary" onClick={handleToggleSyncClick}>{isSyncActive ? "Stop sync" : "Start sync"}</button>
        <button className="button button--secondary" onClick={handleLinkStylesClick}>Link styles</button>

        <div className={cn("input")}>
            <textarea
                value={mapping}
                onChange={handleInputChange}
                className={cn(css.input, "input__field")} placeholder="Placeholder"/>
        </div>

        {inputError && <span>{inputError}</span>}

        <button className="button button--primary" onClick={handleMappingSaveClick}>Update</button>
    </div>;
}

export default App;