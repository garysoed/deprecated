const glob = require('glob');
const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  entry: {
    "test": glob.sync("./src/**/*_test.ts"),
  },
  // entry: "./src/async/atomic_test.ts",
  output: {
    filename: "bundle.js",
    path: __dirname + "/out"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {// Used to resolve duplicate packages. Make sure that we always use the ones in the root.
    alias: {
      'grapevine': path.resolve('./node_modules/grapevine'),
      'gs-tools': path.resolve('./node_modules/gs-tools'),
      'rxjs': path.resolve('./node_modules/rxjs'),
      'tslib': path.resolve('./node_modules/tslib'),
      'mask': path.resolve('./node_modules/mask'),
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
    ]
  },

  mode: "development",

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "jasmine": "jasmine"
  },

  watch: true,
});
