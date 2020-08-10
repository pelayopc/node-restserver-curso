const express = require("express");
const _ = require("underscore");
const { verificaToken } = require("../middlewares/autenticacion");

let app = express();

let Producto = require("../models/producto");

// ============================
// Obtener productos
// ============================

app.get("/productos", verificaToken, (req, res) => {
  // productos
  // populate: usuario y categoria
  //paginado
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);
  Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "nombre")
    .exec((err, productos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          productos,
          cuantos: conteo,
        });
      });
    });
});

// ============================
// Obtener producto by id
// ============================

app.get("/productos/:id", (req, res) => {
  //populate: usuario categoria
  let id = req.params.id;
  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "nombre")
    .exec((err, productosDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err,
        });
      }
      if (!productosDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "ID no existe",
          },
        });
      }

      res.json({ ok: true, productosDB });
    });
});

// ============================
// Buscar producto
// ============================
app.get("/productos/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;

  let regex = new RegExp(termino, "i");
  Producto.find({ nombre: termino })
    .populate("categoria", "nombre")
    .exec((err, productosDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err,
        });
      }
      res.json({ ok: true, productosDB });
    });
});
// ============================
// Crear producto
// ============================
app.post("/productos", verificaToken, (req, res) => {
  // grabar el usuario
  // grabar una categoria del listado
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    usuario: req.usuario._id,
    disponible: body.disponible,
    categoria: body.categoria,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    //usuarioDB.password = null;
    productoDB
      .populate("usuario")
      .populate("categoria")
      .execPopulate()
      .then(
        function () {
          res.status(201).json({
            ok: true,
            producto: productoDB,
          });
        },
        function () {
          res.status(400).json({
            ok: false,
            err: {
              message: "Categoría no encontrada",
            },
          });
        }
      );
  });
});
// ============================
// Actualizar producto
// ============================
app.put("/productos/:id", verificaToken, (req, res) => {
  // grabar el usuario
  //grabar una categoria del listado
  let id = req.params.id;
  let body = _.pick(req.body, [
    "nombre",
    "precioUni",
    "descripcion",
    "disponible",
    "categoria",
  ]);

  body.usuario = req.usuario._id;

  Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: err,
        messaje: "Producto no encontrado",
      });
    }
    productoDB
      .populate("usuario")
      .populate("categoria")
      .execPopulate()
      .then(
        function () {
          res.json({
            ok: true,
            producto: productoDB,
          });
        },
        function () {
          res.json({
            ok: false,
            err: {
              message: "Categoría no encontrada",
            },
          });
        }
      );
  });
});
// ============================
// Borrar producto
// ============================
app.delete("/productos/:id", verificaToken, (req, res) => {
  // grabar el usuario
  // disponible a false
  let id = req.params.id;
  usuario = req.usuario._id;

  Producto.findByIdAndUpdate(
    id,
    { usuario, disponible: false },
    { new: true },
    (err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err,
        });
      }
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: err,
          messaje: "Producto no encontrado",
        });
      }
      productoDB
        .populate("usuario")
        .populate("categoria")
        .execPopulate()
        .then(
          function () {
            res.json({
              ok: true,
              producto: productoDB,
            });
          },
          function () {
            res.json({
              ok: false,
              err: {
                message: "Categoría no encontrada",
              },
            });
          }
        );
    }
  );
});
module.exports = app;
