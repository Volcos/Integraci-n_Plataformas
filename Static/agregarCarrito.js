const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function agregarCarrito(id_carrito,id_producto,cantidad,id_tipo_cliente) {
    let db;
    try {
      db = await getConnection();

      result = await db.execute(
        `SELECT CANTIDAD FROM CARRITO_ITEM WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
        { id_carrito, id_producto },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length > 0) {
      await db.execute(
        `UPDATE CARRITO_ITEM 
         SET CANTIDAD = CANTIDAD + :cantidad 
         WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
        { id_carrito, id_producto, cantidad }
      );
    } else {
        if(id_tipo_cliente == 1 || id_tipo_cliente == 2){
            const precio = await db.execute(
            `SELECT PRECIO_CLIENTE FROM PRODUCTO WHERE ID_PRODUCTO = :id_producto`,
            { id_producto },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            );

            precio_unitario = precio.rows[0].PRECIO_CLIENTE;
            
        }else if (id_tipo_cliente == 3){
            const precio = await db.execute(
            `SELECT PRECIO_EMPRESA FROM PRODUCTO WHERE ID_PRODUCTO = :id_producto`,
            { id_producto },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            );

            precio_unitario = precio.rows[0].PRECIO_EMPRESA;
        }
      
        await db.execute(
            `INSERT INTO CARRITO_ITEM (ID_CARRITO, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
            VALUES (:id_carrito, :id_producto, :cantidad, :precio_unitario)`,
            { id_carrito, id_producto, cantidad, precio_unitario }
        );
    }

    await db.commit();

    return true;
    } catch (e) {
      return {success:false,error:e}
    }
    
}

module.exports = agregarCarrito;