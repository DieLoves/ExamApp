const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'universal';

console.log(APP_VERSION);

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export', // Outputs a Single-Page Application (SPA).
	distDir: APP_VERSION == 'universal' ? './dist' : `./dist/${APP_VERSION}`, // Changes the build output directory to `./dist/`.
};

export default nextConfig;
