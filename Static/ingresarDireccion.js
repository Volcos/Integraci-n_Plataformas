const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function ingresarDireccion(id_pedido,direccion) {
    let db;
    try {
      db = await getConnection();

      let result  = await db.execute(
        `INSERT INTO DESPACHO (DIRECCION,ID_PEDIDO) VALUES (:direccion,:id_pedido)`,
        { 
            direccion:direccion,
            id_pedido:id_pedido
        }
      );

      await db.commit();

      return {success:true};
    } catch (e) {
      console.log(e);
      return {success:false, error:e};
    }
    
}

module.exports = ingresarDireccion;