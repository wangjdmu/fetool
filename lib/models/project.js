'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _mutli = require('./mutli.config');

var _mutli2 = _interopRequireDefault(_mutli);

var _plugins = require('../plugins');

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

var _uglifyjsWebpackPlugin2 = _interopRequireDefault(_uglifyjsWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NO_PROTOCAL_URL = /^\/\/\w+(\.\w+)+/;

var Project = function () {
  /**
   * Project 构造函数
   * @param {当前的工作目录} cwd
   * @param {运行环境，'development或者production'} env
   */
  function Project(cwd, env) {
    _classCallCheck(this, Project);

    this.cwd = cwd;
    this.NODE_ENV = env;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    var userConfig = this.getUserConfig(this.configFile);
    this.userConfig = userConfig;
    this.config = new _mutli2.default(this);
  }

  _createClass(Project, [{
    key: 'getUserConfig',
    value: function getUserConfig(module) {
      delete require.cache[require.resolve(module)];
      return require(module);
    }

    /**
     *
     * @param {cb: funtion, type: 'base|js|css', port: '端口'} cb，主要是对config进行再加工，type：主要是指定哪一种配置，分为三种，baseConfig,jsConfig,cssConfig
     * @param options, 启动server的配置
     */

  }, {
    key: 'getServerCompiler',
    value: function getServerCompiler() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          cb = _ref.cb,
          type = _ref.type;

      var options = arguments[1];

      var config = this.getConfig(type);
      if (_lodash2.default.isFunction(cb)) {
        config = cb(config);
      }
      if (options.https || options.port === 80) {
        config.output.publicPath = '//localhost' + config.output.publicPath;
      } else {
        config.output.publicPath = '//localhost:' + options.port + config.output.publicPath;
      }
      config.plugins.push(new _plugins.ProgressPlugin());
      return (0, _webpack2.default)(config);
    }
  }, {
    key: 'getConfig',
    value: function getConfig(type) {
      return this.config.getConfig(type);
    }
  }, {
    key: 'pack',
    value: function pack(options) {
      spinner.text = 'start pack';
      spinner.start();
      var startTime = Date.now(),
          // 编译开始时间
      configs = this._getWebpackConfigs(options);
      (0, _webpack2.default)(configs, function (err, stats) {
        spinner.text = 'end pack';
        spinner.text = '';
        spinner.stop();
        if (err) {
          error(err.stack || err);
          if (err.details) {
            error(err.details);
          }
        }
        var packDuration = Date.now() - startTime > 1000 ? Math.floor((Date.now() - startTime) / 1000) + 's' : Date.now() - startTime + 'ms';
        log('Packing Finished in ' + packDuration + '.\n');
        if (!options.analyze) {
          // 如果需要分析数据，就不要退出进程
          process.exit(); // 由于编译html比编译js快，所以可以再这边退出进程。
        }
      });
    }
  }, {
    key: '_getWebpackConfigs',
    value: function _getWebpackConfigs(options) {
      var outputPath = void 0,
          configs = [];
      var cssConfig = this.getConfig('css'),
          jsConfig = this.getConfig('js');
      outputPath = jsConfig.output.path;
      configs.push(jsConfig); // 默认会有js配置
      if (!_lodash2.default.isEmpty(cssConfig.entry)) {
        // 如果cssConfig有配置
        this._setCssPackConfig(cssConfig, options);
        this._setPublicPath(cssConfig, options.env);
        configs.push(cssConfig);
      }

      this._setJsPackConfig(jsConfig, options);
      if (options.analyze) {
        // 是否启用分析
        jsConfig.plugins.push(new _webpackBundleAnalyzer.BundleAnalyzerPlugin());
      }
      this._setHtmlComplierPlugin(jsConfig, options);
      this._setPublicPath(jsConfig, options.env);
      fs.removeSync(outputPath); // cssConfig和jsConfig的out.path是一样的，所以只需要删除一次就行。
      this._clearVersion();
      return configs;
    }

    /**
     * 清理版本号文件夹
     */

  }, {
    key: '_clearVersion',
    value: function _clearVersion() {
      var verPath = sysPath.join(this.cwd, 'ver');
      if (fs.existsSync(verPath)) {
        _shelljs2.default.rm('-rf', verPath);
      }
      _mkdirp2.default.sync(verPath);
    }
  }, {
    key: '_setCssPackConfig',
    value: function _setCssPackConfig(config, options) {
      config.devtool = '';
      config.plugins.push(new _plugins.CssIgnoreJSPlugin());
      config.plugins.push(new _plugins.ProgressPlugin());
      config.plugins.push(new _webpack2.default.optimize.ModuleConcatenationPlugin());
      config.plugins.push(new _plugins.CompilerLoggerPlugin());
      if (options.min) {
        config.plugins.push(new _plugins.ReplaceCssHashPlugin());
        config.plugins.push(new _plugins.UglifyCSSPlugin());
        config.plugins.push(new _plugins.VersionPlugin(sysPath.join(this.cwd, 'ver'), this.config.entryExtNames));
      }
    }
  }, {
    key: '_setJsPackConfig',
    value: function _setJsPackConfig(config, options) {
      config.devtool = '';
      config.plugins.push(new _plugins.ProgressPlugin());
      config.plugins.push(new _webpack2.default.optimize.ModuleConcatenationPlugin());
      config.plugins.push(new _plugins.CompilerLoggerPlugin());
      if (options.min) {
        config.plugins.push(new _uglifyjsWebpackPlugin2.default({
          parallel: true,
          cache: options.cache ? sysPath.join(this.cwd, '.cache/uglifyjs') : false
        }));
        config.plugins.push(new _plugins.VersionPlugin(sysPath.join(this.cwd, 'ver'), this.config.entryExtNames));
      }
    }
  }, {
    key: '_setHtmlComplierPlugin',
    value: function _setHtmlComplierPlugin(config, options) {
      if (options.compile === 'html') {
        config.plugins.push(new _plugins.HtmlCompilerPlugin(this.cwd, options.path));
      }
    }
  }, {
    key: '_setPublicPath',
    value: function _setPublicPath(config, env) {
      if (NO_PROTOCAL_URL.test(config.output.publicPath)) {
        // 如果是已经带绝对路径的配置就忽略
        return;
      }
      var domain = '';
      if (env) {
        // 如果指定了环境
        domain = '' + this.userConfig.servers[env]['domain'];
      } else {
        // 如果没有指定环境
        var globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
        if (globalConfig.domain) {
          // 如果有设置全局的默认域名
          domain = globalConfig.domain;
        }
      }
      config.output.publicPath = '' + domain + config.output.publicPath;
    }
  }, {
    key: 'build',
    value: function build(options) {
      this.pack(Object.assign({
        min: true
      }, options || {}));
    }
  }]);

  return Project;
}();

exports.default = Project;