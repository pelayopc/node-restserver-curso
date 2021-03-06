const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require("../models/usuario");
const app = express();

app.post("/login", (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err,
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe, (Usuario) o contraseña incorrectos",
        },
      });
    }
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe, Usuario o (contraseña) incorrectos",
        },
      });
    }
    let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
      expiresIn: process.env.CADUCIDAD_TOKEN,
    });
    res.json({
      ok: true,
      usuario: usuarioDB,
      token,
    });
  });
});

// configuraciones de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  //const userid = payload["sub"];
  // console.log(payload.name);
  // console.log(payload.email);
  // console.log(payload.picture);
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}
//verify().catch(console.error);

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;
  console.log("1");
  let googleUser = await verify(token).catch((e) => {
    console.log("2");
    return res.status(403).json({
      ok: false,
      err: e,
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.assignSocket(500).json({
        ok: false,
        err,
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.assignSocket(400).json({
          ok: false,
          err: {
            message: "Debe usar su autenticación normal",
          },
        });
      } else {
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      }
    } else {
      // usuario no existe
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = googleUser.google;
      usuario.password = ":)";

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.assignSocket(500).json({
            ok: false,
            err,
          });
        }
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      });
    }
  });

  // res.send({
  //   usuario: googleUser,
  // });
});

module.exports = app;
