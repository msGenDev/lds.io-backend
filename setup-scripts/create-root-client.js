'use strict';

var PromiseA = require('bluebird').Promise;
var path = require('path');
var promise;

var config;
var configFile = path.join(__dirname, '..', 'priv', 'config.json');
config = require(configFile);
// TODO setup should attach sql passphrase for this db
config.knexInst = require('../lib/knex-connector').create(config.knex);

promise = require('../bookcase/bookshelf-models').create(config, config.knexInst).then(function (Db) {
  var OauthClientFactory = require('../lib/oauthclients.js');
  var oauthclients = OauthClientFactory.createController(config, Db)
  return oauthclients;
});

promise.then(function (OauthClients) {
  // TODO login as myself before creating root app
  OauthClients.create(config, {
    id: 'groot'
  , iAmGroot: true
  }, {
    name: "LDS Connect"
  , desc: "Internal, root-level application for LDS Connect"
  , urls: [
      "https://ldsconnect.org"
    , "https://lds.io"
    , "https://local.ldsconnect.org"
    , "https://local.lds.io"
    , "https://beta.ldsconnect.org"
    , "https://beta.lds.io"
    ]
  , ips: ["66.172.10.146", "45.56.23.132", "127.0.0.1"]
  , logo: "https://ldsconnect.org/images/moroni-120px-inverted.png"
  , live: true
  , repo: "https://github.com/LDSorg/lds.io-backend"
  , keywords: ["lds.io", "api", "root"]
  }).then(function ($client) {
    $client.related('apikeys').forEach(function ($key) {
      var title = ($key.get('test') && 'Development' || 'Production');
      title += ' ' + ($key.get('insecure') && 'Browser' || 'Server');
      title += ' Key:';
      console.log(title);
      console.log('    ' + $key.get('key'));
      if ($key.get('secret') && 'anonymous' !== $key.get('secret')) {
        console.log('    ' + $key.get('secret'));
      }
      console.log('');
    });

    setTimeout(function () {
      process.exit();
    }, 300);
  });
});
