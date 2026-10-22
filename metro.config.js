// Expo's default config + a debug ID in each bundle, so Sentry matches crash reports to their source maps
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

config.resolver.sourceExts.push('sql'); // Drizzle migrations
config.resolver.assetExts.push('wasm'); // expo-sqlite on web

// expo-sqlite on web needs SharedArrayBuffer, which requires these two headers
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
