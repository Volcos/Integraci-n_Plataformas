const OracleDB = require('oracledb');
let getConnection = require('./db.js')


async function mostrarCarritos(id_cliente) {
     let db;
    try {
      db = await getConnection();

      let result = await db.execute(
        `SELECT * FROM CARRITO WHERE ID_CLIENTE = :id_cliente`,
        { id_cliente },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length > 0) {
        return result.rows;
      } else {
        result = await db.execute(
          `INSERT INTO CARRITO (ID_CLIENTE) VALUES (:id_cliente)
          RETURNING ID_CARRITO INTO :id_out`,
          {
            id_cliente,
            id_out: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
          }
        );
        id_carrito = result.outBinds.id_out[0]; // <------------------------CODIGO BASURA QUE ME DA FLOJERA ARREGLAR PEGA PA TI BENJA FUTURO 

        result = await db.execute(
        `SELECT * FROM CARRITO WHERE ID_CLIENTE = :id_cliente`,
        { id_cliente },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

      }

      await db.commit();

      return result.rows;

    } catch (e) {
      return e
    }
}

module.exports = mostrarCarritos;