import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache= localforage.createInstance({
    name:'fileCache',
});


export const unpkgPathPlugin = (inputResult:string) => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      //handle root entry file of 'index.js'
      build.onResolve({filter:/(^index\.js$)/},()=>{
        return{path: 'index.js',namespace:'a'}
      })
      // handle relative path in a module
     build.onResolve({filter:/^\.+\//},(args:any)=>{
       return {
                 namespace:'a',
                path: new URL(args.path, 'http://unpkg.com' + args.resolveDir+'/').href ,
            };
     })

      //handle main file of a module
      build.onResolve({ filter: /.*/ },async (args: any)=>{
        return { path: `https://unpkg.com/${args.path}`,namespace: "a" };
        
      })

      // build.onResolve({ filter: /.*/ }, async (args: any) => {
      //   
      //   if (args.path === "index.js") {
      //     return { path: args.path, namespace: "a" };
      //   }

      //   if(args.path.includes('./') || args.path.includes('../')){
      //       return {
      //            namespace:'a',
      //           path: new URL(args.path, 'http://unpkg.com' + args.resolveDir+'/').href ,
      //       };
      //   }

        
      //   //  return { path: `https://unpkg.com/${args.path}`,namespace: "a" };
        
      // });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);

        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: `
             import {react,useState} from 'react';
              console.log(react, reactDOM);
            `,
          };
        }

        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        //if it is, return it immeditly
        if(cachedResult){
            return cachedResult
        }

        const { data ,request} = await axios.get(args.path);
        // console.log(request)
        const result ={
             loader: "jsx",
          contents: data,
          resolveDir:new URL('./',request.responseURL).pathname,
        }
       
        //store response in cache
        await fileCache.setItem(args.path, result)

        
      });
    },
  };
};
