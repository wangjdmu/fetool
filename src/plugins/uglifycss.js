import uglifycss from 'uglifycss'
import { RawSource } from 'webpack-sources'

class UglifyCSS {
  constructor(options) {
  }
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      compilation.chunks.forEach((chunk) => {
        chunk.files.forEach((fileName) => {
          if (sysPath.extname(fileName) === '.css') {
            let file = compilation.assets[fileName];
            let code = uglifycss.processString(compilation.assets[fileName].source())
            compilation.assets[fileName] = new RawSource(code)
          }
        })
      })
      callback()
    })
  }
}

export default UglifyCSS