import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "tests/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  {
    rules: {
      // In Next.js App Router client components, fetching on mount within useEffect
      // is standard practice. react-hooks/set-state-in-effect is an experimental compiler rule
      // introduced in v7 of eslint-plugin-react-hooks.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
