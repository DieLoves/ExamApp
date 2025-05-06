const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'universal';

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export', // Outputs a Single-Page Application (SPA).
	distDir: APP_VERSION == 'universal' ? undefined : `./dist/${APP_VERSION}`, // Changes the build output directory to `./dist/`.
	cleanDistDir: true,
};

export default nextConfig;
