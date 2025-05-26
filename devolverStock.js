let getConnection = require('./db.js')
async function devolverStock(sucursal, producto) {
    let db;
    try {
        db = await getConnection();
        const stock = await db.execute(
            `SELECT cantidad FROM inventario WHERE id_sucursal = :1 AND  id_producto = :2`,
            {
                1: sucursal,
                2: producto
            },
            { autoCommit: true }
            
        );
        console.log(stock);
        return stock;
    } catch (e) {
        return e;
    }
}

module.exports = devolverStock;