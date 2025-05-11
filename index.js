const express = require("express");
let getConnection = require('./db.js')

const app = express();

app.use(express.json());

/* 
---------------------
INGRESAR STOCK
---------------------   
*/ 

app.put('/agregarStock/:idProducto/:idSucursal', async (req,res) =>{
    let db;
    const {cantidad} = req.body
    try {
        db = await getConnection();
        const result = await db.execute(`
          UPDATE inventario 
          SET cantidad = cantidad + :cantidad
          WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
        {
          cantidad: cantidad,
          idSucursal: parseInt(req.params.idSucursal),
          idProducto: parseInt(req.params.idProducto) 
        },
      { autoCommit: true });
      
        console.log(result);
        res.send(result)

    } catch (e) {
        res.status(500).send('Error al conectar: '+ e.message);
    }
});

/*
---------------------
REBAJAR STOCK
---------------------
*/

app.put('/rebajarStock/:idProducto/:idSucursal', async (req,res) =>{
    let db;
    const {cantidad} = req.body
    try {
        db = await getConnection();
        const result = await db.execute(`
          UPDATE inventario 
          SET cantidad = cantidad - :cantidad
          WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
        {
          cantidad: cantidad,
          idSucursal: parseInt(req.params.idSucursal),
          idProducto: parseInt(req.params.idProducto) 
        },
      { autoCommit: true });
      
        console.log(result);
        res.send(result)

    } catch (e) {
        res.status(500).send('Error al conectar: '+ e.message);
    }
})



app.listen(3000);
console.log(`El servidor esta en linéa en el puerto ${3000}`)

