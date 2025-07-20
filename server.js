require('dotenv').config(); // 👈 Importante que vaya al inicio

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

let salida = "apagado"; // Estado de salida

// 📦 Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

// 📄 Esquema y modelo para guardar los registros
const registroSchema = new mongoose.Schema({
  temperatura: Number,
  salida: String, // opcional: puedes guardar el estado si lo deseas
  timestamp: { type: Date, default: Date.now }
});

const Registro = mongoose.model('Registro', registroSchema);

// 🌡️ Ruta para recibir temperatura y guardar en MongoDB
app.post('/api/temperatura', async (req, res) => {
  const { temperatura } = req.body;
  const registro = new Registro({ temperatura, salida });

  try {
    await registro.save(); // 💾 Guardar en MongoDB
    console.log("🌡️ Temperatura guardada:", temperatura);
    res.send({ success: true });
  } catch (error) {
    console.error("❌ Error al guardar en MongoDB:", error);
    res.status(500).send({ success: false });
  }
});

// 📊 Obtener los últimos 20 registros
app.get('/api/temperatura', async (req, res) => {
  try {
    const registros = await Registro.find().sort({ timestamp: -1 }).limit(20);
    res.json(registros);
  } catch (error) {
    console.error("❌ Error al obtener registros:", error);
    res.status(500).send({ error: "Error al obtener registros" });
  }
});

// 🔌 Obtener estado de salida
app.get('/api/salida', (req, res) => {
  res.send(salida);
});

// 🔁 Actualizar estado de salida
app.post('/api/salida', (req, res) => {
  const { estado } = req.body;
  if (estado === "encendido" || estado === "apagado") {
    salida = estado;
    return res.send({ success: true });
  }
  res.status(400).send({ error: "Estado inválido" });
});

// 👉 Ruta raíz para ver si está funcionando
app.get("/", (req, res) => {
  res.send("🌐 Backend IoT funcionando correctamente 🚀");
});

// 🚀 Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
