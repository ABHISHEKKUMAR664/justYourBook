import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
    const ref = useRef<any>();
    const [input, setInput] = useState("");
    const [code, setCode] = useState("");

    const startService = async () => {
        const service = await esbuild.startService({
            worker: true,
            wasmURL: "/esbuild.wasm",
        });
        ref.current = service;
        console.log(ref.current);
    };


    useEffect(() => {
        startService();
    }, []);



    const onClick = async () => {
        if (!ref.current) {
            return;
        }
        const result = await ref.current.build({
            entryPoints: ["index.js"],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(input)],
            // define: {
            //     'process.env.NODE_ENV:"production"',
            //     global: 'window',
            // },
        });
        setCode(result.outputFiles[0].text);
        console.log(result);
    };



    return (
        <div>
            <textarea onChange={(e) => setInput(e.target.value)}></textarea>
            <div>
                <button onClick={onClick}>submit</button>
            </div>
            <pre>{code}</pre>
        </div>
    );
};

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
