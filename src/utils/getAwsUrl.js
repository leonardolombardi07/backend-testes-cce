const s3 = require("../services/awsStorage");

const getAwsUrl = (key) => {
  const url = s3.getSignedUrl("getObject", {
    Bucket: require("../config/keys").awsBucket,
    Key: key,
    Expires: 180,
  });

  return url;
};

module.exports = getAwsUrl;
