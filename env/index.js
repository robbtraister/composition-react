'use strict'

module.exports = ({ react }) => ({
  react: {
    appId: process.env.APP_ID || react.appId || 'app',
    fileLimit: Number(process.env.FILE_LIMIT) || react.fileLimit || 100 * 1024
  }
})
