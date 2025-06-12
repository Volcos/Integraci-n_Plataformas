const OracleDB = require('oracledb');
let getConnection = require('./db.js')
const devolverProductosCarrito = require('./devolverProductosCarrito.js');
const devolverStock = require('./devolverStock.js');
const seleccionarSucursal = require('./seleccionarSucursal.js');
async function generarPedido(id_carrito) {
    let db;
    try {
      db = await getConnection();

      const productos = await devolverProductosCarrito(id_carrito);
      
      const result = await db.execute(
        `INSERT INTO PEDIDO (ID_CARRITO) VALUES (:id_carrito) RETURNING ID_PEDIDO INTO :id_pedido`,
            {
                id_carrito,
                id_pedido: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }   
            }
            
      );
      console.log(result.outBinds.id_pedido[0]);
      for (const producto in productos) {
        console.log(productos[producto].ID_PRODUCTO)
        await db.execute(
            `INSERT INTO DETALLE_PEDIDO (ID_PEDIDO, ID_PRODUCTO, NOMBRE, PRECIO_UNITARIO,CANTIDAD) VALUES (:id_pedido,:id_producto,:nombre,:precio_unitario,:cantidad)`,
            {
                id_pedido: result.outBinds.id_pedido[0],
                id_producto: productos[producto].ID_PRODUCTO,
                nombre: productos[producto].NOMBRE,
                precio_unitario: productos[producto].PRECIO_UNITARIO,
                cantidad: productos[producto].CANTIDAD
            }
        );
        await seleccionarSucursal(productos[producto].ID_PRODUCTO,productos[producto].CANTIDAD);
      }

      

      return {success:true,id_pedido:result.outBinds.id_pedido[0]};
    } catch (e) {
      console.log(e)  
      return false;
    }
    
}

module.exports = generarPedido;