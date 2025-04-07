const { whenDev, whenProd } = require('@craco/craco');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Cache webpack modules for faster rebuilds
      webpackConfig.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Split chunks for better caching
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };

      // Production optimizations
      if (process.env.NODE_ENV === 'production') {
        // Optimize JS minification
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ];

        // Add gzip compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );
      }

      // Bundle analyzer in analyze mode
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
          })
        );
      }

      return webpackConfig;
    },
  },
}; 