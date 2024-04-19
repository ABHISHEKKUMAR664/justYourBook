import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

// const fileCache= localforage.createInstance({
//     name:'fileCache',
// });


export const unpkgPathPlugin = () => {
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
      //   console.log("onResole", args);
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

          },
  };
};
