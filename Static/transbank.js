// transbank.js
const { WebpayPlus, Options, IntegrationApiKeys, Environment } = require('transbank-sdk');

const webpayTransaction = new WebpayPlus.Transaction(
  new Options(
    '597055555532', 
    IntegrationApiKeys.WEBPAY, 
    Environment.Integration
  )
);

module.exports = webpayTransaction;
