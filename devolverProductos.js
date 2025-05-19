let getConnection = require('./db.js')
async function devolverProductos() {
    let db;
    try {
        db = await getConnection();
        const productos = db.execute(
            `SELECT nombre, descripcion FROM producto`
        );
        return productos;
    } catch (e) {
        return e;
    }
}

module.exports = devolverProductos;