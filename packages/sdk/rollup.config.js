import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/creepjs.umd.js',
      format: 'umd',
      name: 'CreepJS',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/creepjs.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
