import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/index.mjs',
    format: 'es'
  },
  plugins: [
    postcss({
      inject: false,
    }),
    postcssLit.default({
      importPackage: 'lit',
    }),
    nodeResolve({
      browser: true,
    }),
    minifyHTML.default({
      options: {
        minifyOptions: {
          conservativeCollapse: true,
          minifyCSS: false, // broken for template strings
          minifyJS: false,
        }
      }
    }),
  ],
};
