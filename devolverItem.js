let getConnection = require('./db.js')
async function devolverItem(sucursal, producto) {
    let db;
    try {
        db = await getConnection();
        const stock = await db.execute(
              `
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio_cliente,p.precio_empresa, i.cantidad 
            FROM producto p 
            JOIN inventario i
            ON p.id_producto = i.id_producto
            WHERE i.id_producto = :1 AND i.id_sucursal = :2
            `
            ,
            {
                1: producto,
                2: sucursal
            },
            { autoCommit: true }
        );
        console.log(sucursal, producto);
        return stock;

    } catch (e) {
        return e;
    }
}

module.exports = devolverItem;