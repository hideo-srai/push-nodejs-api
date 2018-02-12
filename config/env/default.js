'use strict';

module.exports = {
  app: {
    title: 'M3 Push',
    description: 'M3 Push',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 5000,
  templateEngine: 'swig',
  // secret and expire for
  apiSecret: 'dp-meanstack-!@#@',
  apiTokenExpire: 24 * 60 * 30, // one month
  // session secret and expire for mobile tokens
  mobileSessionSecret: 'MEANSESSION',
  mobileTokenExpire: 24*60*7, // one week
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    dest: './tmp/', // tmp uploads path
    limits: {
      fileSize: 20*1024*1024 // Max file size in bytes (20 MB)
    }
  },
  redis: {
    host:      '127.0.0.1',
    port:      6379
  },
  aws: { // s3
    bucket: 'dp-mean',
    accessKeyId: 'AKIAJ7MS2AC3YICO235Q',
    secretAccessKey: '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'
  },
  twilio: {
    sID: 'AC28065995b21eb5356ef2225b8fe0625f',
    token: 'a9cbf35a43dbad9d75d5233c0c742891',
    from: '+13476583205'
  },
  email: {
    from: 'no-reply@m3solution.com'
  },
  customEvents: [{
    name: 'M3 Push Sent',
    eventValue: '',
    eventTarget: 'notification',
    eventType: 'receive'
  }, {
    name: 'M3 Push Clicked',
    eventValue: '',
    eventTarget: 'notification',
    eventType: 'click'
  }, {
    name: 'On Screen Sent',
    eventValue: 'nova',
    eventTarget: 'notification',
    eventType: 'receive'
  }]
};
