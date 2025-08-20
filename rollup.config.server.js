import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/server/notificationServer.js',
  output: [
    {
      file: 'dist/server/notificationServer.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/server/notificationServer.esm.js',
      format: 'es',
      exports: 'named'
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs()
  ],
  external: ['web-push'] // Don't bundle web-push
}
