module.exports = {
  cacheId: 'rray',
  swDest: 'dist/service-worker.js',
  dontCacheBustURLsMatching: /\.[0-9a-f]{8}\.[a-z0-9]+$/,
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,png,jpg,gif,svg,ico,webp,woff2,json,webmanifest}',
    'index.{html,css}'
  ],
  navigateFallbackAllowlist: [/^(?!\/api)[~a-zA-Z0-9-/]*$/],
  navigateFallback: '/index.html'
};
