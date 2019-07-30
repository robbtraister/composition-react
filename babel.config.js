'use strict'

module.exports = {
  plugins: [
    '@babel/syntax-dynamic-import'
  ],
  presets: [
    '@babel/env',
    '@babel/react',
    [
      '@babel/typescript',
      {
        isTSX: true,
        allExtensions: true
      }
    ]
  ]
}
