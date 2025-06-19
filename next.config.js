/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: ['your-domain.com'], // sesuaikan jika pakai <Image src="...">
  },

  // Uncomment jika kamu perlu custom ekstensi halaman:
  // pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],
};

module.exports = nextConfig;