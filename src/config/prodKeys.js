module.exports = {
  mongoUri: process.env.MONGO_URI,
  jwbSecretKey: process.env.JWB_SECRET_KEY,
  podioClientId: process.env.PODIO_CLIENT_ID,
  podioAppSecret: process.env.PODIO_APP_SECRET,
  podioRedirectUrl: process.env.PODIO_REDIRECT_URL,
  staticImagesUrl: process.env.STATIC_IMAGES_URL,
  sendGridApiKey: process.env.SEND_GRID_API_KEY,
  sendGridSenderEmail: process.env.SEND_GRID_SENDER_EMAIL,
  awsBucket: process.env.BUCKET_NAME,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
};
