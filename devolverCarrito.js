const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function devolverCarrito(id_cliente) {
    let db;
    try {
      db = await getConnection();

      let result = await db.execute(
        `SELECT ID_CARRITO FROM CARRITO WHERE ID_CLIENTE = :id_cliente`,
        { id_cliente },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      let id_carrito;

      if (result.rows.length > 0) {
        id_carrito = result.rows[0].ID_CARRITO;
      } else {
        result = await db.execute(
          `INSERT INTO CARRITO (ID_CLIENTE) VALUES (:id_cliente)
          RETURNING ID_CARRITO INTO :id_out`,
          {
            id_cliente,
            id_out: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
          }
        );
        id_carrito = result.outBinds.id_out[0];
      }

      await db.commit();

      return id_carrito;

    } catch (e) {
      return e
    }
    
}

module.exports = devolverCarrito;