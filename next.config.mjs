const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'tech';

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export', // Outputs a Single-Page Application (SPA).
	distDir: APP_VERSION == 'tech' ? './dist/tech' : './dist/human', // Changes the build output directory to `./dist/`.
};

export default nextConfig;
