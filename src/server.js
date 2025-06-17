
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import connection from './database.js';
import pool from './database.js';
import dotenv from 'dotenv';
import { google } from 'googleapis';

const app = express();
const port = 3015;

dotenv.config()

// Configuración de subida de archivos temporal
const upload = multer({ dest: 'uploads/' }); 

app.use(cors({
  origin: ['http://localhost:5173', 'http://bluelink.local'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Consultar tabla tblPreturno
app.get('/preturno', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    await connection.query(`SET lc_time_names = 'es_ES'`);

    const [results] = await connection.query(`
      SELECT 
        tp.id, 
        tp.cedula, 
        tu.nombre AS \`nombre completo\`,
        tu.grupo,
        tp.pc_ingreso as "FIRMA",
        tp.evaluacion as "evaluación",
        tp.preturno,
        DATE_FORMAT(tp.fecha, '%Y-%M-%d %H:%i:%s') AS \`fecha y hora\`, 
        tp.estado
      FROM tblpreturno tp
      INNER JOIN tblusuarios tu ON tp.cedula = tu.cedula ORDER BY id DESC
    `);

    res.json(results);
  } catch (err) {
    console.error('Error en /preturno:', err);
    res.status(500).json({ error: 'Error al procesar la consulta' });
  } finally {
    if (connection) connection.release();
  }
});

// Consultar tabla tblregistroPreturno
app.get('/registros', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`SET lc_time_names = 'es_ES'`);

    const [results] = await connection.query(`
      SELECT id, grupo, cliente, campaña, evaluacion as evaluación, docpreturno as "preturno", DATE_FORMAT(fecha, '%Y-%M-%d %H:%i:%s') AS \`fecha y hora\`FROM tblregistroPreturno
       ORDER BY id DESC`);

    res.json(results);
  } catch (err) {
    console.error('Error en /registros:', err);
    res.status(500).json({ error: 'Error al procesar la consulta' });
  } finally {
    if (connection) connection.release();
  }
});

//Agregar usuarios
app.post('/agregar', async (req, res) => {
  const { cedula, nombre, grupo } = req.body;

  if (!cedula || !nombre || !grupo ) {
    return res.status(400).json({ error: 'Faltan datos (cedula, nombre o grupo)' });
  }

  const query = 'INSERT INTO tblusuarios (cedula, nombre, grupo) VALUES (?, ?, ?)';

  try {
    const conn = await pool.getConnection();
    try {
      const [results] = await conn.query(query, [cedula, nombre, grupo]);
      res.json(results);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error al insertar usuario:', err);
    res.status(500).json({ error: 'Error al insertar usuario' });
  }
});

// Cargar autenticacion de Google
const auth = new google.auth.GoogleAuth({
  keyFile: 'src\\components\\repositorio-preturno-462496c1f0c4.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});
//Insertar en tblregistroPreturno
app.post('/insertar', upload.single('archivo'), async (req, res) => {
  const { grupo, cliente, campania, evaluacion } = req.body;
  const file = req.file;

  if (!grupo || !cliente || !campania || !evaluacion || !file) {
    return res.status(400).json({ error: 'Faltan datos o archivo' });
  }

  try {
    // Preparar Drive API
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    // Renombrar archivo con fecha actual
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const fechaActual = `${año}-${mes}-${dia}_${horas}-${minutos}-${segundos}`;
    const extension = path.extname(file.originalname);
    const nombreFinal = path.basename(file.originalname, extension) + `_${fechaActual}${extension}`;

    const fileMetadata = {
      name: nombreFinal,
      parents: ['1zU9fW5vvo5doXdZxyWjdsax5qPgUwvqa'], // ID de la carpeta en Drive
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const uploaded = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = uploaded.data.id;

    // Hacer publico el archivo
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const publicUrl = `https://drive.google.com/file/d/${fileId}/view`;

    // Insertar en la base de datos
    const conn = await pool.getConnection();
    try {
      const query = `
        INSERT INTO tblregistroPreturno 
        (id, grupo, cliente, campaña, evaluacion, docPreturno, fecha)
        VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT)
      `;
      const [results] = await conn.query(query, [grupo, cliente, campania, evaluacion, publicUrl]);
      res.json({ message: 'Preturno registrado y archivo subido', results });
    } finally {
      conn.release();
    }

    // Eliminar el archivo temporal
    fs.unlinkSync(file.path);
  } catch (err) {
    console.error('❌ Error general:', err);
    res.status(500).json({ error: 'Error en el proceso de registro y subida' });
  }
});





app.listen(port, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${port}`)
})