const express = require("express");
const _ = require("underscore");
const {
  verificaToken,
  verificaAdmin_Rol,
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");
const Usuario = require("../models/usuario");

//===========================
// Todas las categorias
//===========================

app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find({})
    .sort("nombre")
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: err,
        });
      }

      Categoria.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          categorias,
          cuantos: conteo,
        });
      });
    });
});

//===========================
// Categoria por ID
//===========================

app.get("/categoria/:id", verificaToken, (req, res) => {
  //Categoria.findById();
  let id = req.params.id;
  Categoria.findById(id)
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err,
        });
      }

      res.json({ ok: true, categoria: categorias });
    });
  // Categoria.findById(id).exec((err, categorias) => {
  //   if (err) {
  //     return res.status(500).json({
  //       ok: false,
  //       err: err,
  //     });
  //   }
  //   Usuario.populate(categorias, { path: "usuario" }, (err, categorias) => {
  //     res.json({ ok: true, categoria: categorias   });
  //   });
  // });
});

//===========================
// Crear nueva categoria
//===========================

app.post("/categoria", [verificaToken, verificaAdmin_Rol], (req, res) => {
  // retorna la nueva categoria
  // id q lo crea. req.usuario.id
  let body = req.body;

  let categoria = new Categoria({
    nombre: body.nombre,
    usuario: req.usuario._id,
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err,
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: err,
      });
    }

    //usuarioDB.password = null;
    Usuario.populate(categoriaDB, { path: "usuario" }, (err, categoriaDB) => {
      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    });
  });
});

//===========================
// Modificar Categoria
//===========================

app.put("/categoria/:id", [verificaToken, verificaAdmin_Rol], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Categoria.findByIdAndUpdate(
    id,
    { nombre: body.nombre },
    { new: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: err,
        });
      }
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: err,
          messaje: "Categoría no encontrada",
        });
      }
      Usuario.populate(categoriaDB, { path: "usuario" }, (err, categoriaDB) => {
        res.json({
          ok: true,
          categoria: categoriaDB,
        });
      });
    }
  );
});

//===========================
// Borrar categoria
//===========================

app.delete("/categoria/:id", [verificaToken, verificaAdmin_Rol], (req, res) => {
  // solo administradores
  // Categoria.findByIdAndRemove (fisicamente)
  let id = req.params.id;
  Categoria.findByIdAndRemove(id, {}, (err, categoriaBorrada) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err,
      });
    }
    if (!categoriaBorrada) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Categoría no encontrada",
        },
      });
    }
    res.json({ ok: true, categoria: categoriaBorrada });
  });
});

module.exports = app;
