import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

import pkg from "../../package.json";

const input = pkg.source;

function createConfig({ file, format }) {
  return {
    input,
    output: [
      {
        exports: "named",
        file,
        format,
        globals: { react: "React" },
        name: "ReactDX",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(
        format === "umd"
          ? {
              include: /\/node_modules\//,
            }
          : undefined
      ),
      typescript({ tsconfig: "./tsconfig.json" }),
      format !== "es" && terser(),
    ].filter(Boolean),
    external: ["react"],
  };
}

export default [
  createConfig({ file: pkg.main, format: "cjs" }),
  createConfig({ file: pkg.module, format: "es" }),
  createConfig({ file: pkg["umd:main"], format: "umd" }),
  {
    input,
    output: [{ file: pkg.types, format: "es" }],
    plugins: [dts.default()],
  },
];
