// import
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
// config JSON response
app.use(express.json());
app.use(cors());
// Models
const User = require("./model/User");

// open route - public
app.get("/", (req, res) => {
  res.status(200).json({ msg: "bem vindo" });
});

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  //check if user exists
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
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
  } catch (error) {
    res.status(400).json({ msg: "token invalido" });
  }
}

//Register User

app.post("/register", async (req, res) => {
  const { name, lastname, email, password } = req.body;

  //   validations
  if (!name) {
    return res.status(422).json({ msg: "o nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "o email é obrigatório" });
  }

  if (!lastname) {
    return res.status(422).json({ msg: "o ultimo nome é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "a senha é obrigatório" });
  }

  //   check if user exist

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "por favor utilize outro email" });
  }

  //create password

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //create user

  const user = new User({
    name,
    email,
    lastname,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "usuario criado com sucesso",id: user.id,email: user.email,
        name: user.name,lastname: user.lastname, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "houve um erro no servidor" });
  }
});

//login user

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //validations

  if (!email) {
    return res.status(422).json({ msg: "o email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "a senha é obrigatório" });
  }

  //chack if user exists

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "usuário não encontrado" });
  }

  //   check if password march

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "senha invalida" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "autenticação realizada com sucesso",id: user.id,email: user.email,
      name:user.name,lastname: user.lastname, token });
  } catch (err) {
    console.log(error);
    res.status(500).json({ msg: "houve um erro no servidor" });
  }
});

// crendentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.bfa9v4t.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen({
      host: "0.0.0.0",
      port: process.env.PORT || 3333,
    });
    console.log("conectou ao banco");
  })
  .catch((err) => console.log(err));
