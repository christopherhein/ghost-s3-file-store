# Ghost S3 File Store

This plugin allows you to use S3 as a file store for your ghost installation. It comes configured to allow for cloudfront domains and fall back to S3 domains. This plugin is known to work in version 0.5.7 of Ghost and with minimal change to the ghost source.

## Installation

    npm install --save ghost-s3-file-store

## Configuration

In your ghost `config.js` setup the necessary blocks of information. This includes setting up an `aws` key for each environment as so:

    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
      assetHost: proccess.env.AWS_ASSET_HOST # Optional
    }

Then all you need to do is open up the `core/server/storage/index.js` file and change

    storageChoice = 'local-file-store';

to

    storageChoice = 's3-file-store';

## Questions

Feel free to post comments or issues in the issues tab, I will be more then willing to help out on any issues you have getting this configured.

## License

Read LICENSE.
