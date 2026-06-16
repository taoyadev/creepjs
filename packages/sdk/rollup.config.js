import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
  }),
];

export default [
  {
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
    plugins,
  },
  {
    input: 'src/full.ts',
    output: [
      {
        file: 'dist/creepjs.full.umd.js',
        format: 'umd',
        name: 'CreepJSFull',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/creepjs.full.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins,
  },
];
