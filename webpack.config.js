var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var webpack = require('webpack');
var devConfig = require('./dev-config');
let env = process.env.NODE_ENV;
let devPages = devConfig.devPages; 
// let js_reg=/<script(\s+)(type=\"text\/javascript\"(\s+))?src=[\"|\'](\/(\w+)\/(\w+)_app.js)[\"|\']>(<\/script>)/gm;
let js_reg=/<script(\s+)(type=\"text\/javascript\"(\s+))?src=[\"|\'](\/(\w+)\/app.js)[\"|\']>(<\/script>)/gm;

function getEntry(src) {
    var pages = fs.readdirSync(src);
    var jsEntry = {};
    for(let i = 0; i < pages.length; i++) {       
        if(!fs.existsSync(path.join(src, pages[i], 'app.js'))) { //判断是否存在入口app.js文件
            continue;
        }
        var key, entry;        
        if(devPages && devPages.length > 0) { //只编译当前开发活动页面，提高编译速度，节约时间成本
            if(devPages.indexOf(pages[i]) >= 0) {
                key = env == 'local' ? path.join(pages[i], 'app.js') : path.join(pages[i], pages[i] + '_app.js');
                //entryAry = env == 'local' ? ["webpack-dev-server/client?http://0.0.0.0:80/", "webpack/hot/only-dev-server"] : [];
                //entryAry = [];
                //entryAry.push(path.join(src, pages[i], 'app.js'));        
                jsEntry[key] = path.join(src, pages[i], 'app.js');                
            }
            continue;
        }
        key = env == 'local' ? path.join(pages[i], 'app.js') : path.join(pages[i], pages[i] + '_app.js');
        //entryAry = env == 'local' ? ["webpack-hot-middleware/client?noInfo=true&reload=true"] : [];
        //entryAry = [];
        //entryAry.push(path.join(src, pages[i], 'app.js'));        
        jsEntry[key] = path.join(src, pages[i], 'app.js');
    }

    console.log(jsEntry)
    return jsEntry;
}


// 自定义插件，替换html中的js文件为压缩后的js文件
function HtmlPlugin(options) {
    this.options = options;
}
HtmlPlugin.prototype.apply = function(compiler) {
    var htmlPath = this.options.htmlPath;
    var dst = this.options.dst;
   
    compiler.plugin('emit', function(compilation, callback) {
        for(var value in compilation.options.entry) {
            var entryAry = value.split('\\');
            var pageFolder = entryAry[entryAry.length - 2]; 
            var entry = path.resolve(htmlPath, pageFolder);
            var outpath = path.resolve(dst, pageFolder);
            outputHtml(entry, outpath, pageFolder);
        }     
        callback();
        function outputHtml(entry, outpath, pageFolder) {
            var fileName = 'index.html';
            if(!fs.existsSync(entry + '/' + fileName)) {
                return;
            }
            var content = fs.readFileSync(entry + '/' + fileName).toString();  
            content = content.replace(js_reg, function(arg){                
                return '<script type="text/javascript" src="//static.iqiyi.com/js/common/' + pageFolder + '_app.js"></script>';               
            });      
            fse.mkdirsSync(outpath);
            fs.writeFileSync(outpath + '/' + fileName, content);
            return content;
        }
    });
}
let config = {
    
}
let plugins = [       
    new HtmlPlugin({
        htmlPath: path.join(__dirname, 'src'),
        dst: path.join(__dirname, 'dist')
    })
    /* new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()  */
];

if(env == 'product') {
    var compress =  new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    });
    plugins.push(compress);
    //plugins.push();
}

module.exports = {
    entry: getEntry(__dirname + '/src'),
    output: {
        path: __dirname + '/dist/',
        filename: '[name]',
        publicPath: ''
    },
    plugins: plugins,
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader:'babel-loader'
                },
                exclude:/node_module/
            }
        ]
    }
}