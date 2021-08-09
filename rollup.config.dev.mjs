import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import livereload from 'rollup-plugin-livereload';
import glob from 'glob';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export default {
  input: 'frontend/index.mjs',
  output: {
    file: 'dist/index.mjs',
    format: 'es'
  },
  plugins: [
    livereload({ delay: 700 }),
    postcss({
      inject: false,
    }),
    postcssLit.default({
      importPackage: 'lit',
    }),
    nodeResolve({
      browser: true,
    }),
    copy({
      flatten: false,
      targets: [
        { src: 'frontend/**/*.{html,woff2,svg,png,webmanifest}', dest: 'dist/' },
        { src: 'frontend/index.css', dest: 'dist/' }, // TODO: postcss
      ]
    }),
    {
      name: 'watch-external',
      buildStart() {
        const dir = dirname(fileURLToPath(import.meta.url));
        glob('frontend/**/*.{html,css,woff2,svg,webmanifest}', {}, (err, files) => {
          if (err) throw err;
          for (const file of files) this.addWatchFile(resolve(dir, file));
        });
      }
    }
  ],
  watch: {
    include: './frontend/**',
    chokidar: true,
  },

  moduleContext: (id) => {
    // In order to match native module behaviour, Rollup sets `this`
    // as `undefined` at the top level of modules. Rollup also outputs
    // a warning if a module tries to access `this` at the top level.
    // The following modules use `this` at the top level and expect it
    // to be the global `window` object, so we tell Rollup to set
    // `this = window` for these modules.
    const thisAsWindowForModules = [
      //'node_modules/codemirror/lib/codemirror.js',
    ];

    if (thisAsWindowForModules.some(id_ => id.trimRight().endsWith(id_))) {
      return 'globalThis';
    }
  }
};
