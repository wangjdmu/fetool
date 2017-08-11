# ft2.0
ft2.0是ft1.0的升级版，设计思想是来自[fekit](https://github.com/rinh/fekit)，基本上所有命令的设计都是来自`fekit`，继承了`fekit`的核心优点。ft2.0除了支持多页应用以外，还支持单页应用。从ft1.0迁移到ft2.0的成本很低，只要稍微修改下配置文件就够了，相应的配置说明，请查看下面的配置文档。

## ft2.0设计核心说明
目前ft2.0支持两种模式：多页面和单页面模式。核心引擎是webpack，因此可以支持市面上的所有前端框架。

### 单页模式
单页面模式会导出两份样式表，一份是`base.css`，这份样式表主要是存放第三方的样式表或者我们自定义的基础样式表,另一份是跟业务相关的css样式表。我们提供了[vue的脚手架](https://github.com/wsfe/vue-boilerplate)，多页面模式提倡，样式表独立出来，然后js里面的样式不被提取出来。大家可以根据自己的需要来选择想要的模式。

### 多页模式


## 安装
npm 安装方式安装
```
npm i -g fet-cli
```
yarn 方式安装
```
yarn global add fet-cli
```

## 命令行说明
请安装fet之后，在命令行运行`fet`查看命令说明，如果对某个命令感兴趣请运行`fet commandName -h`查看。

## config demo

```
{
  mode: 'multi',  // 默认是多页面的应用，单页应用选择填写single。
  lint: { // 基于standard的
    cwd: 'src/js', // 选择需要校验的文件路径，默认是src
    opts: {
      ignore: [],   // glob 形式的排除列表 (一般无须配置)
      fix: false,   // 是否自动修复问题
      globals: [],  // 声明需要跳过检测的定义全局变量
      plugins: [],  // eslint 插件列表
      envs: [],     // eslint 环境
      parser: ''    // js 解析器（例如 babel-eslint）
    }
  },
  servers: { // 配置同步到哪台机器
    dev1: {
      host: 10.8.203.61,
      domain: '//dev1.wangsu.com',
      port: 63501,
      local: './', // 默认当前目录
      path: '/usr/local/src', //服务器端要存放的地址
      sudo: false
    },
    dev2: {
      host: 10.8.203.190,
      domain: '//beta1.wangsu.com',
      port: 63501,
      path: '/usr/local/src',
      sudo: false
    }
  },
  entryExtNames: { // 告诉ft2.0哪些后缀是属于js或者css，ft才能根据这些来选择编译配置
    css: ['.css', '.scss', '.sass', '.less'],
    js: ['.js', '.jsx', '.vue']
  },
  config: {
    exports: [ // 要编译压缩的文件
      "js/module/home/index.js",
      "css/index.css",
      "css/base.css",
      "css/module/index.less"
    ],
    webpackConfig: function(jsConfig, cssConfig, options, context) {
    // webpackConfig: function(config, options, context) { // 根据不同的模式，有不同的选择，单页模式，没有cssConfig
      // do what you want todo
      // 当对样式没有特殊配置时，可以直接返回jsConfig就行，否则就要两者都返回。
      return jsConfig; // return {jsConfig: jsConfig, cssConfig: cssConfig};
    }
  }
}
```

## todo list
<!-- 1. 将压缩代码那部分的线程模块由`compute-cluster`改成`[Hamsters.js](http://www.hamsters.io/)` -->
1. 将自己编写的多线程压缩改成官方新提供的工具[uglifyjs-webpack-plugin](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)
2. 修复重复打包问题，提取出公共包
3. 将webpack升级到最新版