import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'], // Your entry file
    outDir: 'dist',          // Output directory for the bundle
    format: ['cjs', 'esm'],  // Output formats: CommonJS and ESM
    dts: true,               // Generate TypeScript declaration files (.d.ts)
    sourcemap: true,         // Generate source maps
    clean: true,             // Clean the output directory before bundling
    target: 'es2016',        // Target ECMAScript version
    minify: true,            // Minify the output
});