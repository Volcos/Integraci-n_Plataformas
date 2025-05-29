let getConnection = require('./db.js')
async function validarStock(id, stock) {
    let db;
    try {
        
        db = await getConnection();
        const stock_minimo = await db.execute(
            `SELECT stock_minimo FROM producto WHERE id_producto = :1`,
            {
                1: id
            },
            { autoCommit: true }
        );
        console.log(stock_minimo)
        if (stock < parseInt(stock_minimo.rows)) {
            return {resultado:true,stock_min:parseInt(stock_minimo.rows)};
        }
        return {resultado:false};
    } catch (e) {
        return e;
    }
}

module.exports = validarStock;