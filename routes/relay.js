const express = require("express");
const router = express.Router();
const Relay = require("../models/Relay");

// 🔁 GET estado actual del relay
router.get("/", async (req, res) => {
  try {
    const ultimo = await Relay.findOne().sort({ fecha: -1 });
    if (ultimo) {
      res.send(ultimo.estado);
    } else {
      res.send("apagado");
    }
  } catch (err) {
    console.error("Error al obtener estado del relay:", err);
    res.status(500).send("Error al consultar estado");
  }
});

// 🔄 POST para cambiar estado del relay
router.post("/", async (req, res) => {
  const { estado } = req.body;
  if (!["encendido", "apagado"].includes(estado)) {
    return res.status(400).send("Estado inválido");
  }

  try {
    const nuevoEstado = new Relay({ estado });
    await nuevoEstado.save();
    res.status(200).send("Estado actualizado");
  } catch (err) {
    console.error("Error al guardar estado del relay:", err);
    res.status(500).send("Error al guardar estado");
  }
});

module.exports = router;
