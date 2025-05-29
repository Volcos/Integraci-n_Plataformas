const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function devolverProductosCarrito(id_carrito) {
    let db;
    try {
      db = await getConnection();

      let result  = await db.execute(
        `SELECT ci.id_carrito,ci.id_producto,ci.cantidad,ci.precio_unitario,p.nombre 
        FROM carrito_item ci
        JOIN producto p ON ci.id_producto = p.id_producto
        WHERE ID_CARRITO= :id_carrito`,
        { id_carrito },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      return result.rows
    } catch (e) {
      return e
    }
    
}

module.exports = devolverProductosCarrito;