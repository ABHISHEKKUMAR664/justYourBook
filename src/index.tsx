import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();

  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    const service = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
    ref.current = service;
    // console.log(ref.current);
  };

  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current || !iframe.current) {
      return;
    }
    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
          'process.env.NODE_ENV':'"production"',
          global: 'window',
      },
    });
    // setCode(result.outputFiles[0].text);
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");
  };
  const html = `
            <html>
                <head></head>
                <body>
                  <div id='root'></div>
                  <script> 
                    window.addEventListener('message', (e)=>{
                       try{
                            eval(e.data)
                       }catch(err){
                         const root=document.querySelector('#root');
                         root.innerHTML= '<div style="color:red"> <h4>Runtime Error</h4>' + err + '</div>';
                       }
                    },false)
                  </script>
                </body>
            </html>
           
        `;

  return (
    <div>
      <textarea onChange={(e) => setInput(e.target.value)}></textarea>
      <div>
        <button onClick={onClick}>submit</button>
      </div>
      <pre>{code}</pre>
      <iframe title="Example" srcDoc={html} sandbox="allow-scripts" ref={iframe}/>
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
