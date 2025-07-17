const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let salida = "apagado";
let historial = [];

app.post('/api/temperatura', (req, res) => {
  const { temperatura } = req.body;
  const registro = { temperatura, timestamp: new Date() };
  historial.push(registro);
  console.log("Temperatura recibida:", temperatura);
  res.send({ success: true });
});

app.get('/api/temperatura', (req, res) => {
  res.json(historial.slice(-20));
});

app.get('/api/salida', (req, res) => {
  res.send(salida);
});

app.post('/api/salida', (req, res) => {
  const { estado } = req.body;
  if (estado === "encendido" || estado === "apagado") {
    salida = estado;
    return res.send({ success: true });
  }
  res.status(400).send({ error: "Estado inválido" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
