let getConnection = require('./db.js')
async function consultarProductos() {
    let db;
    try {
        db = await getConnection();
        const productos = await db.execute(
            `
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio_cliente,p.precio_empresa, SUM(i.cantidad) "CANTIDAD_TOTAL"
            FROM producto p 
            JOIN inventario i
            ON p.id_producto = i.id_producto
            GROUP BY p.id_producto, p.nombre, p.descripcion, p.precio_cliente,p.precio_empresa
            `
        );
        return productos;
    } catch (e) {
        return e;
    }
}

module.exports = consultarProductos;