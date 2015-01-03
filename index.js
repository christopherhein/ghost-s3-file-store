// # S3 File System Image Storage module

var express   = require('express'),
    fs        = require('fs-extra'),
    path      = require('path'),
    util      = require('util'),
    Promise   = require('bluebird'),
    errors    = require('../errors'),
    config    = require('../config'),
    utils     = require('../utils'),
    baseStore = require('./base'),
    AWS       = require('aws-sdk'),
    awsConfig,
    s3;

function S3FileStore() {
  awsConfig = config.aws;
  AWS.config.update(awsConfig);
  
  s3 = new AWS.S3({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    bucket: awsConfig.bucket,
    region: awsConfig.region
  });
  Promise.promisifyAll(s3);
}
util.inherits(S3FileStore, baseStore);

// ### Save
// Saves the image to storage (the file system)
// - image is the express image object
// - returns a promise which ultimately returns the full url to the uploaded image
S3FileStore.prototype.save = function (image) {
    var targetDir = this.getTargetDir(),
        awsPath = awsConfig.assetHost ? awsConfig.assetHost : 'https://' + awsConfig.bucket + '.s3.amazonaws.com/',
        targetFilename;

    return this.getUniqueFileName(this, image, targetDir).then(function (filename) {
      targetFilename = filename;
      return Promise.promisify(fs.readFile)(image.path);
    }).then(function (buffer) {
      return s3.putObjectAsync({
          Bucket: awsConfig.bucket,
          Key: targetFilename,
          Body: buffer,
          ContentType: image.type,
          ACL: "public-read",
          CacheControl: 'max-age=' + (30 * 24 * 60 * 60)
      });
    }).then(function () {
      return awsPath + targetFilename;
    }).catch(function (e) {
      errors.logError(e);
      return Promise.reject(e);
    });
};

S3FileStore.prototype.exists = function (filename) {
  return new Promise(function (resolve) {
    fs.exists(filename, function (exists) {
      resolve(exists);
    });
  });
};

// middleware for serving the files
S3FileStore.prototype.serve = function () {
  // a no-op, these are absolute URLs
  return function (req, res, next) {
    next();
  };
};

module.exports = S3FileStore;
