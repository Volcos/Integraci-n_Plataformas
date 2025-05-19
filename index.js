const express = require("express");
let getConnection = require('./db.js')
let devolverStock = require('./devolverStock.js')
const validarStock = require("./stockMinimo.js");
const devolverProductos = require("./devolverProductos.js");
require('dotenv').config();

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

/*
---------------------
CONSULTAR STOCK
---------------------
*/
app.get('/devolverStock', async (req,res) => {
  const sucursal = req.body.sucursal;
  const producto = req.body.producto;

  

  let stock = await devolverStock(sucursal,producto);

  let stock_final = parseInt(stock.rows);

  const validacion = await validarStock(req.body.producto,stock.rows);
  
  

  console.log(stock_final);

  if (validacion.resultado){
    res.send('El stock actual corresponde a: ' + stock.rows+"\n El stock se encuentra por debajo del stock minimo: "+validacion.stock_min);
  } else {
    res.send('El stock actual corresponde a: ' + stock.rows);
  };
})

/*
---------------------
CONSULTAR PRODUCTOS
---------------------
*/

app.get('/consultarProductos', async (req,res) => {
  lista_productos = await devolverProductos();

  res.send(lista_productos.rows);
})


app.listen(3000, `${process.env.IP}`, () => {
  console.log('Servidor accesible desde red local en el puerto 3000');
});

console.log(`El servidor esta en linéa en el puerto ${3000}`)

