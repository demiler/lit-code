import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/rray-code.mjs',
  output: [
    {
      sourcemap: false,
      format: 'umd',
      name: 'rray-code',
      file: 'build/rray-code.min.mjs',
    },
    {
      sourcemap: false,
      format: 'es',
      name: 'rray-code',
      file: 'build/rray-code.module.mjs',
    }
  ],
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
    terser(),
  ],
};
