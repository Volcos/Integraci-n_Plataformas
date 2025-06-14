const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function eliminarCarrito(id_carrito) {
    let db;
    try {
      db = await getConnection();

      await db.execute(`DELETE FROM carrito_item WHERE id_carrito = :id_carrito`, { id_carrito });

      let result  = await db.execute(
        `DELETE FROM carrito
        WHERE id_carrito = :id_carrito`,
        { id_carrito }
      );

      await db.commit();

      return result
    } catch (e) {
      return e
    }
    
}

module.exports = eliminarCarrito;