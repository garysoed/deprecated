const glob = require('glob');
const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  entry: {
    "test": glob.sync("./src/**/*.test.ts"),
    "main": "./src/main/main.ts"
  },
  // entry: "./src/async/atomic_test.ts",
  output: {
    filename: "bundle-[name].js",
    path: __dirname + "/out"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {// Used to resolve duplicate packages. Make sure that we always use the ones in the root.
    alias: {
      'grapevine': path.resolve('./node_modules/grapevine'),
      'gs-testing': path.resolve('./node_modules/gs-testing'),
      'gs-tools': path.resolve('./node_modules/gs-tools'),
      'gs-types': path.resolve('./node_modules/gs-types'),
      'mask': path.resolve('./node_modules/mask'),
      'nabu': path.resolve('./node_modules/nabu'),
      'persona': path.resolve('./node_modules/persona'),
      'rxjs': path.resolve('./node_modules/rxjs'),
      'tslib': path.resolve('./node_modules/tslib'),
    },
    extensions: [".ts", ".tsx", ".js", ".json", ".html", ".css"],
    symlinks: false,
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: {loader: 'html-loader?exportAsEs6Default'}
      },
      {
        test: /\.css$/,
        use: {loader: 'raw-loader'}
      },
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
