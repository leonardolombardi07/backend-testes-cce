const AWS = require("aws-sdk");

const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com/swtestes");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: require("../config/keys").awsAccessKeyId,
  secretAccessKey: require("../config/keys").awsSecretKey,
});

module.exports = s3;
