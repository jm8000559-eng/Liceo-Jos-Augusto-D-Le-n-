const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL desde variable de entorno
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: false
});

// Modelo Usuario
const Usuario = sequelize.define('Usuario', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  cedula: { type: DataTypes.STRING, unique: true, allowNull: false },
  telefono1: DataTypes.STRING,
  telefono2: DataTypes.STRING,
  año: DataTypes.STRING,
  seccion: DataTypes.STRING,
  edad: DataTypes.INTEGER,
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('estudiante', 'profesor', 'coordinador'), defaultValue: 'estudiante' },
  public_grades: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Modelo Nota
const Nota = sequelize.define('Nota', {
  materia: DataTypes.STRING,
  nota: DataTypes.DECIMAL(4,2),
  fecha: DataTypes.DATE
});

// Relaciones
Usuario.hasMany(Nota, { foreignKey: 'estudianteId' });
Nota.belongsTo(Usuario, { foreignKey: 'estudianteId' });

// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API del Liceo funcionando' });
});

// Ruta de registro
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, cedula, telefono1, telefono2, año, seccion, edad, email, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      nombre, cedula, telefono1, telefono2, año, seccion, edad, email,
      password: hashedPassword,
      rol: rol || 'estudiante'
    });
    res.json({ message: 'Usuario creado', usuarioId: usuario.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });
    
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '24h' }
    );
    
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sincronizar base de datos y arrancar servidor
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
