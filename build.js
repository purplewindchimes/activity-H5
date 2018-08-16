var jsconfig = require('./webpack.config');
var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var compiler = webpack(jsconfig);
var env = process.env.NODE_ENV;
var opn = require('opn');

compiler.run(function(err, stats) {
    console.log(stats.toString({
        chunks: false,
        colors: true
    }));
});
if (env == 'local') {
    var options = {        
        hot: true,        
        compress: true,
        publicPath: "",
        open: true,
        stats: {
            colors: true,
            chunks: false
        },
        contentBase: [path.join(__dirname, "src")] //contentBase必须为绝对路径
    };
    //WebpackDevServer.addDevServerEntrypoints(jsconfig, options);
    var server = new WebpackDevServer(compiler, options);
    server.listen(80, "test.m.iqiyi.com", function () {
        console.log('server start: http://test.m.iqiyi.com:80');
        //opn('http://test.m.iqiyi.com');
    });
}
