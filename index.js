// # S3 File System Image Storage module

var express   = require('express'),
    fs        = require('fs-extra'),
    path      = require('path'),
    util      = require('util'),
    Promise   = require('bluebird'),
    errors    = require('../../core/server/errors'),
    config    = require('../../core/server/config'),
    utils     = require('../..//core/server/utils'),
    baseStore = require('../../core/server/storage/base'),
    AWS       = require('aws-sdk'),
    awsConfig,
    s3;

function GhostS3FileStore() {
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
util.inherits(GhostS3FileStore, baseStore);

// ### Save
// Saves the image to storage (the file system)
// - image is the express image object
// - returns a promise which ultimately returns the full url to the uploaded image
GhostS3FileStore.prototype.save = function (image) {
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

GhostS3FileStore.prototype.exists = function (filename) {
  return new Promise(function (resolve) {
    fs.exists(filename, function (exists) {
      resolve(exists);
    });
  });
};

// middleware for serving the files
GhostS3FileStore.prototype.serve = function () {
  // a no-op, these are absolute URLs
  return function (req, res, next) {
    next();
  };
};

module.exports = GhostS3FileStore;
