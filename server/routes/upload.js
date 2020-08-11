const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

const fs = require("fs");

const path = require("path");

//default options
app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:tipo/:id", function (req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files) {
    return res
      .status(400)
      .json({ ok: false, err: { message: "No se ha seleccionado archivo" } });
  }

  //validar tipo
  let tiposValidos = ["productos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    res.status(500).json({
      ok: false,
      err: {
        message: "Los tipos permitidos son: " + tiposValidos.join(", "),
        tipo: tipo,
      },
    });
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let archivo = req.files.archivo;

  // Extensiones permitidas

  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];
  console.log(extension);
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extension) < 0) {
    res.status(500).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son: " + extensionesValidas.join(", "),
        ext: extension,
      },
    });
  }

  // Cambiar nombre archivo
  //234324432dsfdsfds-123.jpg
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  // Use the mv() method to place the file somewhere on your server
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err,
      });

    // aquí ya se cargo la imagen
    if (tipo === "usuarios") {
      imagenUsuario(id, res, nombreArchivo);
    } else {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "usuarios");
      res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!usuarioDB) {
      borraArchivo(nombreArchivo, "usuarios");
      res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe",
        },
      });
    }

    borraArchivo(usuarioDB.img, "usuarios");

    usuarioDB.img = nombreArchivo;

    usuarioDB.save((err, usuarioGuardado) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo,
        message: "Usuario guardado",
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, registroDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "productos");
      res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!registroDB) {
      borraArchivo(nombreArchivo, "productos");
      res.status(400).json({
        ok: false,
        err: {
          message: "El producto no existe",
        },
      });
    }
    console.log(nombreArchivo);
    borraArchivo(registroDB.img, "productos");

    registroDB.img = nombreArchivo;

    registroDB.save((err, registroDBGuardado) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        producto: registroDBGuardado,
        img: nombreArchivo,
        message: "Producto guardado",
      });
    });
  });
}

function borraArchivo(nombreImagen, tipo) {
  // verificar que existe ruta

  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );
  // si existe, borro
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;
