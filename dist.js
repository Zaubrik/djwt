import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

const result = await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./mod.ts"],
  outfile: `./dist/djwt.js`,
  bundle: true,
  format: "esm",
});

const testing = await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./tests/test.ts"],
  outfile: `./dist/test.js`,
  bundle: true,
  format: "esm",
});


esbuild.stop();
