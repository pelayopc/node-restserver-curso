const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { schema } = require("./usuario");

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
  nombre: {
    type: String,
    unique: true,
    required: [true, "El nombre es necesario"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  usuario: { type: Schema.ObjectId, ref: "Usuario" },
});

// usuarioSchema.methods.toJSON = function () {
//   let user = this;

//   let userObject = user.toObject();
//   delete userObject.password;

//   return userObject;
// };

categoriaSchema.plugin(uniqueValidator, { message: "{PATH} debe ser único" });

module.exports = mongoose.model("Categoria", categoriaSchema);
