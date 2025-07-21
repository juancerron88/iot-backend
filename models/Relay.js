const mongoose = require("mongoose");

const RelaySchema = new mongoose.Schema({
  estado: {
    type: String,
    enum: ["encendido", "apagado"],
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Relay", RelaySchema);
