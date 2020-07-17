// =====================================
// Puerto
// =====================================

process.env.PORT = process.env.PORT || 3000;

// ENTORNO

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// BD

let urlDB;
if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB =
    "mongodb+srv://strider:ofDJ82p88AjRYFn2@cluster0.wh1uz.mongodb.net/cafe";
}
process.env.URLDB = urlDB;
