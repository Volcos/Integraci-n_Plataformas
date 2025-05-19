let getConnection = require('./db.js')
async function validarStock(id, stock) {
    let db;
    try {
        db = await getConnection();
        const stock_minimo = db.execute(
            `SELECT stock_minimo FROM producto WHERE id_producto = :1`,
            {
                1: id
            },
            { autoCommit: true }
        );
        if (stock < stock_minimo) {
            return {resultado:true,stock_min:10};
        }
        return {resultado:false};
    } catch (e) {
        return e;
    }
}

module.exports = validarStock;