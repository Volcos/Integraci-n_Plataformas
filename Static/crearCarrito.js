const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function crearCarrito(id_cliente) {
    let db;
    try {
      db = await getConnection();

      let result  = await db.execute(
        `INSERT INTO CARRITO (id_cliente) VALUES (:id_cliente)`,
        { id_cliente }
      );

      await db.commit();

      return result
    } catch (e) {
      return e
    }
    
}

module.exports = crearCarrito;