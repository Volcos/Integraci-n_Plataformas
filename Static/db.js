// db.js
require('dotenv').config();

const oracledb = require('oracledb');

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Conectado a Oracle Database');
    return connection;
  } catch (err) {
    console.error('Error al conectar:', err);
    throw err;
  }
}

module.exports = getConnection;
