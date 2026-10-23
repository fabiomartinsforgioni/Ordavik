import { build } from "esbuild";

await build({
  entryPoints: ["src/js/app.js"],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  outfile: "assets/js/app.js",
  legalComments: "none",
  banner: { js: "// Gerado por npm run build. Edite os módulos em src/js." },
});
console.log("Build concluído: assets/js/app.js (compatível com arquivo e HTTP).");
