// =====================================
// Puerto
// =====================================

process.env.PORT = process.env.PORT || 3000;

// ENTORNO

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//  vencimiento del token
// 60 seg * 60 min * 24 * 30
process.env.CADUCIDAD_TOKEN = "48h";

// seed token

process.env.SEED = process.env.SEED || "este-es-el-seed-desarrollo";

// BD

let urlDB;
if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// Google CLIENTID

process.env.CLIENT_ID =
  process.env.CLIENT_ID ||
  "610016464139-f1mkk86ti3jissu1ench2cikn3pdvd9p.apps.googleusercontent.com";
