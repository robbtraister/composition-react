'use strict'

const path = require('path')

const { DefinePlugin } = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const {
  core: {
    isProd,
    projectRoot
  },
  react: {
    appId,
    fileLimit
    // pageTitle = 'composition'
  }
} = require('@composition/core/env')

const optimization = {
  minimizer: [
    new TerserWebpackPlugin({
      sourceMap: true
    }),
    new OptimizeCSSAssetsWebpackPlugin({
    })
  ]
}

const getAbsoluteRequire = (mod) =>
  require.resolve(mod).replace(new RegExp(`(/node_modules/${mod})/.*`), (_, m) => m)

const resolve = {
  alias: {
    'prop-types': getAbsoluteRequire('prop-types'),
    react: getAbsoluteRequire('react'),
    'react-dom': getAbsoluteRequire('react-dom'),
    'react-router-dom': getAbsoluteRequire('react-router-dom'),
    'styled-components': getAbsoluteRequire('styled-components'),
    '~': projectRoot,
    '@': path.join(projectRoot, 'src', 'views', 'app')
  },
  extensions: [
    '.tsx',
    '.ts',
    '.mjsx',
    '.mjs',
    '.jsx',
    '.js',
    '.yaml',
    '.yml',
    '.json',
    '.scss',
    '.sass',
    '.css'
  ]
}

const rules = ({ isProd, isServer }) => [
  {
    test: /\.(eot|gif|jpe?g|otf|png|svg|ttf|woff2?)$/,
    use: {
      loader: 'url-loader',
      options: {
        fallback: 'file-loader',
        limit: fileLimit,
        name: (isProd)
          ? 'assets/[hash].[ext]'
          : 'assets/[path][name].[ext]',
        publicPath: '/dist/'
      }
    }
  },
  {
    test: /\.s?[ac]ss$/,
    use: (
      (isServer)
        ? [{ loader: MiniCssExtractPlugin.loader }]
        : []
    ).concat(
      {
        loader: 'css-loader',
        options: {
          modules: {
            mode: 'local'
          },
          onlyLocals: !isServer,
          sourceMap: true
        }
      }
    )
  },
  {
    test: /\.s[ac]ss$/,
    use: {
      loader: 'sass-loader',
      options: {
        implementation: require('sass')
      }
    }
  },
  {
    test: /\.ya?ml$/,
    use: ['json-loader', 'yaml-loader']
  },
  {
    test: /\.m?[jt]sx?$/,
    exclude: /[\\/]node_modules[\\/](?!@composition[\\/])/,
    use: {
      loader: 'babel-loader',
      options: {
        ...require('./babel.config'),
        babelrc: false
      }
    }
  }
]

module.exports = (env, argv) => {
  const devtool = (isProd)
    ? 'hidden-source-map'
    : 'eval-source-map'

  const mode = (isProd)
    ? 'production'
    : 'development'

  return [
    {
      devtool,
      entry: {
        app: path.resolve(__dirname, 'src', 'client', 'app'),
        login: path.resolve(__dirname, 'src', 'client', 'login')
      },
      mode,
      module: {
        rules: rules({ isProd })
      },
      optimization: {
        ...optimization,
        runtimeChunk: {
          name: 'runtime'
        },
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          name (mod, chunks, cacheGroupKey) {
            return (chunks.length > 1)
              ? 'common'
              : chunks[0].name
          }
        }
      },
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.join(projectRoot, 'dist'),
        publicPath: '/dist/'
      },
      plugins: [
        new DefinePlugin({
          __COMPOSITION_APP_ID__: JSON.stringify(appId)
        })
      ],
      resolve,
      target: 'web'
    },
    {
      devtool,
      entry: {
        app: path.join(projectRoot, 'src', 'views', 'app'),
        login: path.join(projectRoot, 'src', 'views', 'login'),
        site: path.join(projectRoot, 'src', 'views', 'site')
      },
      externals: {
        'prop-types': require.resolve('prop-types'),
        react: require.resolve('react'),
        'react-dom/server': require.resolve('react-dom/server'),
        'react-router-dom': require.resolve('react-router-dom'),
        'styled-components': require.resolve('styled-components')
      },
      mode,
      module: {
        rules: rules({ isProd, isServer: true })
      },
      output: {
        filename: 'build/[name].js',
        libraryTarget: 'commonjs2',
        path: projectRoot
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'dist/[name].css',
          chunkFilename: 'dist/[name].css'
        })
      ],
      resolve,
      target: 'node'
    }
  ]
}
