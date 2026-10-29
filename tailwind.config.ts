import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#0b080c', rose: '#ff3f79', crimson: '#e51c44' } } }, plugins: [] };
export default config;
