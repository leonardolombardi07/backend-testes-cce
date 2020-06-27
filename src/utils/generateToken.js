const crypto = require("crypto");

exports.generateToken = async () => {
  const token = await new Promise((resolve, reject) => {
    crypto.randomBytes(32, (error, buffer) => {
      if (error) {
        console.log(error);
        reject("Não foi possível gerar o token");
      }

      resolve(buffer.toString("hex"));
    });
  });

  return token;
};
