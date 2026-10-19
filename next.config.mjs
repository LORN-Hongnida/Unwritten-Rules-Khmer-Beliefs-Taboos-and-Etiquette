/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` both write to `.next` by default, so a build
  // run while the dev server is up replaces its chunks and the running page
  // starts 404ing on its own CSS and JS. Verification builds set
  // NEXT_DIST_DIR to keep out of the dev server's way.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
