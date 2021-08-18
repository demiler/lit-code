import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg'

export default {
  input: 'src/index.mjs',
  output: {
    sourcemap: false,
    format: 'umd',
    file: 'docs/index.mjs',
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
    svg(),
    minifyHTML.default({
      options: {
        minifyOptions: {
          conservativeCollapse: true,
          minifyCSS: false, // broken for template strings
          minifyJS: false,
        }
      }
    }),
    terser(),
  ],
};
