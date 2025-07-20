require('dotenv').config(); // 👈 Importante que vaya al inicio

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

let salida = "apagado"; // Estado actual del relay/LED

// 📦 Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000 // antes era 10000
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

// 📄 Esquema y modelo para el potenciómetro
const potenciometroSchema = new mongoose.Schema({
  valor: Number,
  timestamp: { type: Date, default: Date.now }
});
const Potenciometro = mongoose.model('Potenciometro', potenciometroSchema);

// 📄 Ruta para registrar el valor del potenciómetro
app.post('/api/potenciometro', async (req, res) => {
  const { valor } = req.body;
  const registro = new Potenciometro({ valor });

  try {
    await registro.save();
    console.log("🌀 Potenciómetro:", valor, "V");
    res.send({ success: true });
  } catch (error) {
    console.error("❌ Error al guardar potenciometro:", error);
    res.status(500).send({ success: false });
  }
});

// 📊 Obtener los últimos 20 valores del potenciómetro
app.get('/api/potenciometro', async (req, res) => {
  try {
    const registros = await Potenciometro.find().sort({ timestamp: -1 }).limit(20);
    res.json(registros);
  } catch (error) {
    console.error("❌ Error al obtener potenciometro:", error);
    res.status(500).send({ error: "Error al obtener registros" });
  }
});

// 🔌 Obtener estado actual del LED/relay
app.get('/api/salida', (req, res) => {
  res.send(salida);
});

// 🔁 Cambiar estado del LED/relay
app.post('/api/salida', (req, res) => {
  const { estado } = req.body;
  if (estado === "encendido" || estado === "apagado") {
    salida = estado;
    return res.send({ success: true });
  }
  res.status(400).send({ error: "Estado inválido" });
});

// 🌐 Ruta de verificación simple
app.get("/", (req, res) => {
  res.send("🌐 Backend IoT funcionando correctamente 🚀");
});

// 🚀 Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
