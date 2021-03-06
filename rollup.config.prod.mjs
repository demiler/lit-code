import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/lit-code.mjs',
  output: {
    sourcemap: false,
    format: 'es',
    name: 'lit-code',
    file: 'build/lit-code.mjs',
  },
  plugins: [
    postcss({
      inject: false,
    }),
    postcssLit.default({
      importPackage: 'lit',
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
    terser(),
  ],
};
