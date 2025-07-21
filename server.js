require('dotenv').config(); // 👈 Importante al inicio

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

let salida = "apagado"; // Estado del relay

// 📦 MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión:', err));

// 📄 Modelos
const potenciometroSchema = new mongoose.Schema({
  valorADC: Number,
  voltaje: Number,
  timestamp: { type: Date, default: Date.now }
});
const Potenciometro = mongoose.model('Potenciometro', potenciometroSchema);

const relaySchema = new mongoose.Schema({
  estado: String,
  fecha: { type: Date, default: Date.now }
});
const Relay = mongoose.model('Relay', relaySchema);

// 📤 Registrar datos del potenciómetro
app.post('/api/potenciometro', async (req, res) => {
  const { valorADC, voltaje } = req.body;
  const registro = new Potenciometro({ valorADC, voltaje });

  try {
    await registro.save();
    console.log("🌀 ADC:", valorADC, "| Voltaje:", voltaje);
    res.send({ success: true });
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).send({ success: false });
  }
});

// 📊 Obtener los últimos 20 registros
app.get('/api/potenciometro', async (req, res) => {
  try {
    const registros = await Potenciometro.find().sort({ timestamp: -1 }).limit(20);
    res.json(registros);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener registros" });
  }
});

// 🔌 Obtener estado actual
app.get('/api/relay', (req, res) => {
  res.send(salida);
});

// 🔁 Cambiar estado y guardar en historial
app.post('/api/relay', async (req, res) => {
  const { estado } = req.body;
  if (estado === "encendido" || estado === "apagado") {
    salida = estado;
    try {
      await Relay.create({ estado });
      console.log("💡 Estado relay guardado:", estado);
    } catch (err) {
      console.error("❌ Error guardando relay:", err);
    }
    return res.send({ success: true });
  }
  res.status(400).send({ error: "Estado inválido" });
});

// 📃 Historial del relay
app.get('/api/relay/historial', async (req, res) => {
  try {
    const historial = await Relay.find().sort({ fecha: -1 }).limit(20);
    res.json(historial);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener historial" });
  }
});

// 🌐 Ruta raíz
app.get("/", (req, res) => {
  res.send("🌐 Backend IoT funcionando 🚀");
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
