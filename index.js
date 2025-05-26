const express = require("express");
let getConnection = require('./db.js')
let devolverStock = require('./devolverStock.js')
const validarStock = require("./stockMinimo.js");
const consultarProductos = require("./consultarProductos.js");
const devolverItem = require("./devolverItem.js");
const devolverCarrito = require("./devolverCarrito.js");
const agregarCarrito = require("./agregarCarrito.js");
const rebajarCarrito = require("./rebajarCarrito.js");
require('dotenv').config();

const app = express();

app.use(express.json());



/*
RUTAS
-----------------------------------
/agregarStock (body -> sucursal,producto,cantidad)

/rebajarStock (body -> sucursal,producto,cantidad)

/devolverStock (body -> sucursal,producto)

/consultarProductos (no body)
*/


/* 
---------------------
INGRESAR STOCK
---------------------   
*/ 

app.put('/agregarStock', async (req,res) =>{
    let db;
    const sucursal = req.body.sucursal;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    try {
        db = await getConnection();
        const result = await db.execute(`
          UPDATE inventario 
          SET cantidad = cantidad + :cantidad
          WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
        {
          cantidad: cantidad,
          idSucursal: sucursal,
          idProducto: producto 
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

app.put('/rebajarStock', async (req,res) =>{
    let db;
    const sucursal = req.body.sucursal;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    try {
        db = await getConnection();
        const result = await db.execute(`
          UPDATE inventario 
          SET cantidad = cantidad - :cantidad
          WHERE id_sucursal = :idSucursal AND id_producto = :idProducto`,
        {
          cantidad: cantidad,
          idSucursal: sucursal,
          idProducto: producto 
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
});

/*
---------------------
CONSULTAR TODOS LOS PRODUCTOS
---------------------
*/

app.get('/consultarProductos', async (req,res) => {
  lista_productos = await consultarProductos();
  let lista_response = [];

  for (let i in lista_productos.rows){
    const [id, nombre, descripcion, precio_cliente,precio_empresa, stock_total] = lista_productos.rows[i];
    lista_response.push(
      {
      id:id,
      nombre:nombre,
      descripcion:descripcion,
      precio_cliente:precio_cliente,
      precio_empresa:precio_empresa,
      stock_total:stock_total
      }
    ); 
  }

  res.json(lista_response);
});

/*
---------------------
CONSULTAR UN PRODUCTO ESPECIFICO
---------------------
*/

app.get('/consultarItem', async (req,res) => {

  let sucursal = req.body.sucursal;
  let producto = req.body.producto;
  let item = []; 
  const db_producto = await devolverItem(sucursal,producto)
  try {
    console.log(db_producto)
    const [id, nombre, descripcion, precio_cliente,precio_empresa, stock] = db_producto.rows[0];
    item.push(
      {
      id:id,
      nombre:nombre,
      descripcion:descripcion,
      precio_cliente:precio_cliente,
      precio_empresa:precio_empresa,
      stock:stock 
      }
    );
    console.log(item);
    res.json(item);
  } catch (e){
    res.send(e)
  }
});

/*
---------------------
AGREGAR AL CARRITO
---------------------
*/

app.post('/agregarCarrito', async (req,res) => {
  const {id_cliente, id_producto, cantidad, id_tipo_cliente} = req.body;

  id_carrito = await devolverCarrito(id_cliente);

  agregar = await agregarCarrito(id_carrito,id_producto,cantidad,id_tipo_cliente);

  console.log(id_carrito);
  console.log(agregar);

  if (agregar) {
    res.send('Producto agregado con exito');
  } else {
    res.send('Algo salió mal: '+ agregar.error);
  }
});

app.delete('/rebajarCarrito', async (req,res) => {
  const {id_cliente, id_producto, cantidad} = req.body;

  id_carrito = await devolverCarrito(id_cliente);

  rebaja = await rebajarCarrito(id_carrito, id_producto,cantidad);

  if (rebaja) {
    res.status(200).json({success:true,mensaje:'Producto rebajado con exito'});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

app.listen(3000, `${process.env.IP}`, () => {
  console.log('Servidor accesible desde red local en el puerto 3000');
});

console.log(`El servidor esta en linéa en el puerto ${3000}`)

