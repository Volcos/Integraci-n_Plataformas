const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function borrarDelCarrito(id_carrito,id_producto) {
    let db;
    try {
        db = await getConnection();

        await db.execute(
            `DELETE FROM CARRITO_ITEM WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
            { id_carrito, id_producto }
        );
     

    await db.commit();

    return true;
    } catch (e) {
      return {success:false,error:e}
    }
    
}

module.exports = borrarDelCarrito;