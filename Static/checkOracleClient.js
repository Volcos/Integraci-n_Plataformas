const oracledb = require('oracledb');


try {
  oracledb.initOracleClient({ libDir: 'C:\\app\\varga\\product\\21c\\dbhomeXE\\bin' }); 
  console.log('Cliente Oracle cargado');
  console.log('Versión:', oracledb.oracleClientVersionString);
} catch (err) {
  console.error('No se pudo cargar Oracle Client:', err.message);
}
