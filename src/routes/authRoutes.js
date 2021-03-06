const { Router } = require("express");
const mongoose = require("mongoose");

const jwb = require("jsonwebtoken");
const axios = require("axios");
const { transporter } = require("../services/sendGridMail");

const keys = require("../config/keys");
const { validateEmail, validatePassword } = require("../utils/validators");
const { getQueryParameterByName } = require("../utils/getters");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const { generateToken } = require("../utils/generateToken");

const User = mongoose.model("User");

const router = Router();

router.get("/auth/podio", (request, response) => {
  response
    .status(200)
    .json(
      `https://podio.com/oauth/authorize?client_id=${keys.podioClientId}&redirect_uri=${keys.podioRedirectUrl}&scope=user`
    );
});

router.get("/auth/podio/callback", async (request, response) => {
  const { url } = request;
  const authCode = getQueryParameterByName("code", url);
  const baseUrl = "https://podio.com/oauth/token/?";
  const body = `grant_type=authorization_code&client_id=${keys.podioClientId}&redirect_uri=${keys.podioRedirectUrl}&client_secret=${keys.podioAppSecret}&code=${authCode}`;

  const postUrl = baseUrl + body;
  const getUserDataUrl = "https://api.podio.com/user/status";
  try {
    const {
      data: { access_token },
    } = await axios.post(postUrl);

    const {
      data: {
        profile: { name, mail },
      },
    } = await axios.get(getUserDataUrl, {
      headers: { Authorization: `OAuth2 ${access_token}` },
    });

    const email = mail[0];
    let user = await User.findOne({ email });
    if (!user) {
      const password = generateRandomPassword();
      user = new User({ name, email, password });
      await transporter.sendMail({
        to: email,
        subject: "Bem vindx à Fluxo testes",
        from: keys.sendGridSenderEmail,
        html: `<h1>Se não quiser entrar com o Pódio sempre, eis a sua senha: ${password}</h1>`,
      });
      await user.save();
    }

    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.send("<script>window.close();</script > ");
    response.status(200).json({ name, email, token });
  } catch (error) {
    response.status(500).json({
      error:
        "Tivemos algum problema nos servidores do Pódio ou no envio do e-mail. Por favor tente novamente mais tarde.",
      detailedError: error.message,
    });
  }
});

router.post("/auth/signup", async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response
      .status(401)
      .json({ error: "Por favor providencie um nome, uma senha e um e-mail." });
  } else if (!validateEmail(email)) {
    return response
      .status(401)
      .json({ error: "Por favor providencie um endereço de e-mail válido." });
  } else if (!validatePassword(password)) {
    return response.status(401).json({
      error:
        "Sua senha precisa conter ao menos 8 caractéres, ao menos uma letra e ao menos um número",
    });
  }

  try {
    const user = new User({ name, email, password });
    await user.save();
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(201).json({
      name,
      email,
      token,
    });
  } catch (error) {
    response.status(500).json({
      error:
        "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
      detailedError: error.message,
    });
  }
});

router.post("/auth/signin", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(422)
      .json({ error: "Por favor providencie um e-mail e uma senha." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return response.status(401).json({
      error:
        "Não conseguimos encontrar esse e-mail. Tente se cadastrar antes de realizar o login.",
    });
  }

  try {
    await user.comparePassword(password);
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(200).json({ name: user.name, email, token });
  } catch (error) {
    response.status(500).json({
      error: "Senha incorreta.",
      detailedError: error.message,
    });
  }
});

router.post("/auth/forgot-password", async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(401).json({
      error: "Por favor providencie um e-mail.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(401).json({
        error:
          "Não conseguimos encontrar um usuário com esse e-mail. Tente se cadastrar antes de requisitar uma nova senha.",
      });
    }

    const token = await generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpirationDate = Date.now() + 1 * 60 * 60 * 1000;
    await user.save();

    // toDo: enviar no html um template bonito
    await transporter.sendMail({
      to: email,
      subject: "Esqueceu sua senha?",
      from: keys.sendGridSenderEmail,
      html: `
      <p> Você pediu pra atualizar sua senha. </p>
      <p> Clique  <a href="${keys.domainBaseUrl}/reset-password/${token}"> nesse link </a> para atualizar sua senha
      Após uma hora o token para atualizar a senha não será mais válido </p>
      `,
    });

    response.status(200).json({
      message: "Email enviado",
    });
  } catch (error) {
    response.status(500).json({
      error:
        "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
      detailedError: error.message,
    });
  }
});

router.post("/auth/reset-password/:token", async (request, response) => {
  const { token } = request.params;
  const { newPassword } = request.body;

  if (!token) {
    return response.status(400).json({
      error: "Por favor forneça um token de autenticação.",
    });
  }

  if (!validatePassword(newPassword)) {
    return response.status(401).json({
      error:
        "Sua senha precisa conter ao menos 8 caractéres, ao menos uma letra e ao menos um número",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpirationDate: { $gt: Date.now() },
    });

    if (!user) {
      return response.status(400).json({
        error: "Por favor forneça um token de autenticação válido.",
      });
    }
    user.password = newPassword;
    await user.save();

    response.status(200).json({
      message: "Senha atualizada com sucesso",
    });
  } catch (error) {
    response.status(500).json({
      error:
        "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
      detailedError: error.message,
    });
  }
});

module.exports = router;
