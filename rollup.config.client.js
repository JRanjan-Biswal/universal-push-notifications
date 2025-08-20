import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/client/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/client/index.esm.js',
      format: 'es',
      exports: 'named'
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs()
  ],
  external: ['react', 'vue', 'web-push'] // Don't bundle these
}
