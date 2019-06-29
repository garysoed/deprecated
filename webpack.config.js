const glob = require('glob');
const WebpackBuilder = require('dev/webpack/builder');

module.exports = (new WebpackBuilder(__dirname))
    // .addEntry('test', glob.sync('./src/**/*.test.ts'))
    .addEntry('main', './src/main.ts')
    .setOutput('[name].js', '/out')
    .addTypeScript()
    .addHtml()
    .setAsNode()
    .buildForDevelopment('Thoth');
