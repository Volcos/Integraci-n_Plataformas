const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function rebajarCarrito(id_carrito,id_producto,cantidad) {
    let db;
    try {
      db = await getConnection();

      result = await db.execute(
        `SELECT CANTIDAD FROM CARRITO_ITEM WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
        { id_carrito, id_producto },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length > 0) {
        if (result.rows[0].CANTIDAD > cantidad) {
            await db.execute(
            `UPDATE CARRITO_ITEM 
            SET CANTIDAD = CANTIDAD - :cantidad 
            WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
            { id_carrito, id_producto, cantidad }
            );
        } else {
            await db.execute(
                `DELETE FROM CARRITO_ITEM WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
                { id_carrito, id_producto }
            );
        }        
    } else {
        return false;
    }

    await db.commit();

    return true;
    } catch (e) {
      return {success:false,error:e}
    }
    
}

module.exports = rebajarCarrito;