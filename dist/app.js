var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// model/User.js
var require_User = __commonJS({
  "model/User.js"(exports, module2) {
    var mongoose2 = require("mongoose");
    var User2 = mongoose2.model("user", {
      name: String,
      email: String,
      password: String,
      lastname: String
    });
    module2.exports = User2;
  }
});

// app.js
require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var app = express();
app.use(express.json());
app.use(cors());
var User = require_User();
app.get("/", (req, res) => {
  res.status(200).json({ msg: "bem vindo" });
});
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(404).json({ msg: "Usu\xE1rio n\xE3o encontrado" });
  }
  res.status(200).json({ user });
});
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Acesso negado" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error2) {
    res.status(400).json({ msg: "token invalido" });
  }
}
app.post("/register", async (req, res) => {
  const { name, lastname, email, password } = req.body;
  if (!name) {
    return res.status(422).json({ msg: "o nome \xE9 obrigat\xF3rio" });
  }
  if (!email) {
    return res.status(422).json({ msg: "o email \xE9 obrigat\xF3rio" });
  }
  if (!lastname) {
    return res.status(422).json({ msg: "o ultimo nome \xE9 obrigat\xF3rio" });
  }
  if (!password) {
    return res.status(422).json({ msg: "a senha \xE9 obrigat\xF3rio" });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(422).json({ msg: "por favor utilize outro email" });
  }
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new User({
    name,
    email,
    lastname,
    password: passwordHash
  });
  try {
    await user.save();
    res.status(201).json({ msg: "usuario criado com sucesso" });
  } catch (error2) {
    console.log(error2);
    res.status(500).json({ msg: "houve um erro no servidor" });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(422).json({ msg: "o email \xE9 obrigat\xF3rio" });
  }
  if (!password) {
    return res.status(422).json({ msg: "a senha \xE9 obrigat\xF3rio" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "usu\xE1rio n\xE3o encontrado" });
  }
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "senha invalida" });
  }
  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id
      },
      secret
    );
    res.status(200).json({ msg: "autentica\xE7\xE3o realizada com sucesso", token });
  } catch (err) {
    console.log(error);
    res.status(500).json({ msg: "houve um erro no servidor" });
  }
});
var dbUser = process.env.DB_USER;
var dbPassword = process.env.DB_PASS;
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@cluster0.bfa9v4t.mongodb.net/?retryWrites=true&w=majority`
).then(() => {
  app.listen({
    host: "0.0.0.0",
    port: process.env.PORT || 3333
  });
  console.log("conectou ao banco");
}).catch((err) => console.log(err));
