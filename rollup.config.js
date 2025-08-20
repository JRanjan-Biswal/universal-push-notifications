import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'es' }
  ],
  plugins: [nodeResolve()],
  external: ['react', 'vue', 'web-push']
};