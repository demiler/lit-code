import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import glob from 'glob';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import svg from 'rollup-plugin-svg'

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/index.mjs',
    format: 'es'
  },
  plugins: [
    serve({
      open: false,
      contentBase: 'dist',
      host: 'localhost',
      port: 8080,
    }),
    postcss({
      inject: false,
    }),
    postcssLit.default({
      importPackage: 'lit',
    }),
    nodeResolve({
      browser: true,
    }),
    svg(),
    {
      name: 'watch-external',
      buildStart() {
        const dir = dirname(fileURLToPath(import.meta.url));
        glob('src/**/*.{html,css,woff2,svg,png,webmanifest}', {}, (err, files) => {
          if (err) throw err;
          for (const file of files) this.addWatchFile(resolve(dir, file));
        });
      }
    }
  ],
  watch: {
    include: './src/**',
    chokidar: true,
  },
};
