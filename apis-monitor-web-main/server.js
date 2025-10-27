import express from 'express';
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const algorithm = 'aes-256-cbc';
const masterkey = Buffer.from(process.env.MASTER_KEY, 'hex');
const iv = Buffer.alloc(16, 0);

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, masterkey, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const API_KEY = decrypt(process.env.API_KEY_ENC);
const FIXED_UUID = "4AE46F3B-8549-4B25-BD15-34CBC625B698";
const app = express();
const PORT = 3000;

//Servir archivos estáticos 
app.use(express.static('public'));

//estatus dinamicos api
app.get('/api/status', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const apis = JSON.parse(fs.readFileSync('apis.json'));

  const results = await Promise.all(
    apis.map(async api => {
      try {
        const body = { apiKey: API_KEY, uuid: FIXED_UUID };
        const response = await axios.post(api.url, body, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });

        const isValidRaw = response.data?.isValid ?? response.data?.data?.esValido;
        const isValid = Boolean(isValidRaw);

        const status = isValid ? 'up' : 'down';
        return { name: api.name, status };

      } catch (error) {
        return { name: api.name, status: 'down' };
      }
    })
  );

  res.json(results);
});

//Servir index.html con query string dinámico para CSS y JS correctos
app.get('/', (req, res) => {
  const timestamp = Date.now(); // timestamp para forzar carga nueva
  const indexPath = path.join('public', 'index.html');

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error cargando index.html');

    //Reemplazar style.css y script.js para agregar ?v=timestamp
    let result = data
      .replace(/style\.css/, `style.css?v=${timestamp}`)
      .replace(/script\.js/, `script.js?v=${timestamp}`);

    res.send(result);
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
