let getConnection = require('./db.js');
const OracleDB = require('oracledb');

async function seleccionarSucursal(id_producto, cantidad) {
    let db; 
    try {
        let sumaStocks = 0;
        let sucursales = [];
        let cantidades = [];
        let restoCantidad = cantidad;
        db = await getConnection();
        const stocks = await db.execute(
            `SELECT ID_SUCURSAL,CANTIDAD FROM INVENTARIO WHERE ID_PRODUCTO = :id_producto ORDER BY CANTIDAD DESC`,
            {
                id_producto
            },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            
        );

        for (a in stocks.rows){
            console.log(stocks.rows[a].CANTIDAD);
            if (stocks.rows[a].CANTIDAD>= cantidad){
                await db.execute(`
                    UPDATE inventario 
                    SET cantidad = cantidad - :cantidad
                    WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
                    {
                        cantidad: cantidad,
                        idSucursal: stocks.rows[a].ID_SUCURSAL,
                        idProducto: id_producto 
                    },
                    { autoCommit: true }
                );

                return sucursales;
            }
        } 

        for (a in stocks.rows){
            sumaStocks += stocks.rows[a].CANTIDAD;
            console.log(sumaStocks);
            sucursales.push(stocks.rows[a].ID_SUCURSAL);
            cantidades.push(stocks.rows[a].CANTIDAD)
            if (sumaStocks>=cantidad) {

                for (b in sucursales){
                    if (restoCantidad > cantidades[b]){
                        restoCantidad -= cantidades[b];
                        await db.execute(`
                            UPDATE inventario 
                            SET cantidad = 0
                            WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
                        {
                            idSucursal: sucursales[b],
                            idProducto: id_producto 
                        },
                        { autoCommit: true }
                        );
                    } else {
                        await db.execute(`
                            UPDATE inventario 
                            SET cantidad = cantidad - :cantidad
                            WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
                        {
                            cantidad: restoCantidad,
                            idSucursal: sucursales[b],
                            idProducto: id_producto 
                        },
                        { autoCommit: true }
                        );
                    }
                }

                return sucursales;
            }
        } 

        

        return stocks.rows;
    } catch (e) {
        return e;
    }
}

module.exports = seleccionarSucursal;