import ReactDOM from "react-dom";
import { useEffect, useRef, useState } from "react";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";

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
        // const result= await ref.current.build(input,{
        //     loader: 'jsx',  //tell esbuild what kind of code we poviding it
        //     target: 'es2015', //use for transpiling process which handle js advance syntax like asyn,await, spread syntax inside an object
        // })
        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin()]

        })
        setCode(result.outputFiles[0].text)
        console.log(result)
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

ReactDOM.render(<App />, document.querySelector("#root"));
