const jwt = require("jsonwebtoken");

// ===================================
// VERRIFICAR TOKEN
// ===================================

let verificaToken = (req, res, next) => {
  let token = req.get("token");

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: "Token no válido",
        },
      });
    }

    req.usuario = decoded.usuario;
    next();
  });

  //res.json({
  // token: token,
  //});
};

// ===================================
// VERRIFICAR Admin Role
// ===================================

let verificaAdmin_Rol = (req, res, next) => {
  let usuario = req.usuario;

  if (usuario.role != "ADMIN_ROLE") {
    res.json({
      ok: false,
      err: {
        message: "El usuario no es administrador",
      },
    });
  } else {
    next();
  }
};

module.exports = {
  verificaToken,
  verificaAdmin_Rol,
};
