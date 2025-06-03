
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import connection from './database.js';
import dotenv from 'dotenv';

const app = express();
const port = 3015;


dotenv.config()

// Configuración de subida de archivos temporal
const upload = multer({ dest: 'uploads/' });

// Configuración de GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_BLK;
const REPO_OWNER = 'jorman-viafara';
const REPO_NAME = 'preturno';
const BRANCH = 'main';

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Consultar tabla
app.get('/preturno', (req, res) => {
  const sql1 = `SET lc_time_names = 'es_ES'`;
  const sql = `
  SELECT 
    tp.id, 
    tp.cedula, 
    tu.nombre AS \`nombre completo\`, 
    DATE_FORMAT(tp.fecha, '%Y-%M-%d %H:%i:%s') AS \`fecha y hora\`, 
    tp.pc_ingreso,
    tp.estado
  FROM tblpreturno tp
  INNER JOIN tblusuarios tu ON tp.cedula = tu.cedula
`;
  connection.query(sql1, (err) => {
    if (err) {
      console.error('Error al establecer lc_time_names:', err);
      return res.status(500).json({ error: 'Error configurando idioma' });
    }
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error al ejecutar consulta:', err);
        return res.status(500).json({ error: 'Error en la consulta' });
      }
      res.json(results);
    });
  });
});

//Agregar usuarios
app.post('/agregar', (req, res) => {
  const { cedula, nombre } = req.body;
  if (!cedula || !nombre) {
    return res.status(400).json({ error: 'Faltan datos (cedula o nombre)' });
  }
  const query = 'INSERT INTO tblusuarios (cedula, nombre) VALUES (?, ?)';
  connection.query(query, [cedula, nombre], (err, results) => {
    if (err) {
      console.error('Error al insertar usuario:', err);
      return resolveEnvPrefix.status(500).json({ error: 'Error al insertar usuario' });
    }
    res.json(results);
  });

});

// Subida de archivo a GitHub
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

  const content = fs.readFileSync(file.path, { encoding: 'base64' });

  // Nombre fijo del archivo en GitHub
  const destFileName = 'preturno' + path.extname(file.originalname); // ejemplo: preturno.pdf, preturno.docx, etc.
  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${destFileName}`;

  try {
    //Verificar si el archivo ya existe en el repositorio
    let sha = null;
    try {
      const getResponse = await axios.get(githubApiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          ref: BRANCH,
        },
      });
      sha = getResponse.data.sha;
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
    }

    // Subir (crear o actualizar) el archivo
    const githubResponse = await axios.put(
      githubApiUrl,
      {
        message: `Subida de archivo como ${destFileName}`,
        content,
        branch: BRANCH,
        ...(sha && { sha }), // incluir sha si se está reemplazando
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    //Limpiar archivo temporal y responder
    fs.unlinkSync(file.path);
    res.json({
      message: 'Archivo subido con éxito',
      url: githubResponse.data.content.download_url,
    });

  } catch (error) {
    console.error('Error al subir a GitHub:', error.response?.data || error.message);
    fs.unlinkSync(file.path); // eliminar incluso si falla
    res.status(500).json({
      error: 'Error al subir a GitHub',
      details: error.response?.data || error.message,
    });
  }
});

//Actualizar archivo JSON
app.post('/update-json', async (req, res) => {

  const { cliente, campaña, link } = req.body;
  if (!cliente || !campaña || !link) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data.json`;

  try {
    // Verificar si data.json ya existe
    let sha = null;

    try {
      const getResponse = await axios.get(githubApiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          ref: BRANCH,
        },
      });
      sha = getResponse.data.sha;
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
    }

    // Crear nuevo contenido que reemplaza completamente el anterior
    const updatedData = {
      cliente,
      campaña,
      link,
      fecha: new Date().toISOString()
    };

    const encoded = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');

    const githubResponse = await axios.put(
      githubApiUrl,
      {
        message: 'Actualización de preturno',
        content: encoded,
        branch: BRANCH,
        ...(sha && { sha }),
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    res.json({ message: 'JSON sobrescrito exitosamente', url: githubResponse.data.content.download_url });
  } catch (error) {
    console.error('Error al actualizar JSON:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al actualizar JSON', details: error.response?.data || error.message });
  }
});



app.listen(port, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${port}`)
})