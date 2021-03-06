'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initMiddlewares;

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _serveIndex = require('serve-index');

var _serveIndex2 = _interopRequireDefault(_serveIndex);

var _httpProxyMiddleware = require('http-proxy-middleware');

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _htmlCompiler = require('./htmlCompiler');

var _htmlCompiler2 = _interopRequireDefault(_htmlCompiler);

var _cors = require('./cors');

var _cors2 = _interopRequireDefault(_cors);

var _webpackStatic = require('./webpackStatic');

var _webpackStatic2 = _interopRequireDefault(_webpackStatic);

var _hashReplacer = require('./hashReplacer');

var _hashReplacer2 = _interopRequireDefault(_hashReplacer);

var _proxyConnection = require('./proxyConnection');

var _proxyConnection2 = _interopRequireDefault(_proxyConnection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function proxy(app) {
  var conf = app.get('fet');
  Object.keys(conf).forEach(function (projectName) {
    var project = conf[projectName];
    app.use('/' + projectName, (0, _httpProxyMiddleware2.default)({
      target: 'http://localhost:' + project.port,
      changeOrigin: true
    }));
  });
}

function initMiddlewares(app, options, conf) {
  app.use(_logger2.default);
  app.use(_proxyConnection2.default);
  app.use(_hashReplacer2.default);
  proxy(app);
  app.use(/.*\.(html|eot|ttf|woff|svg|json)/, _cors2.default);
  app.use(_webpackStatic2.default);
  app.use('*.html', (0, _htmlCompiler2.default)(process.cwd()));
  app.use((0, _serveIndex2.default)(process.cwd()));
  app.use((0, _serveStatic2.default)(process.cwd(), {
    index: false
  }));
  app.use((0, _compiler2.default)(options));
};