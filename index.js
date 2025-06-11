const express = require("express");
let getConnection = require('./Static/db.js')
let devolverStock = require('./Static/devolverStock.js')
const validarStock = require("./Static/stockMinimo.js");
const consultarProductos = require("./Static/consultarProductos.js");
const devolverItem = require("./Static/devolverItem.js");
const devolverProductosCarrito = require("./Static/devolverProductosCarrito.js");
const agregarCarrito = require("./Static/agregarCarrito.js");
const rebajarCarrito = require("./Static/rebajarCarrito.js");
const mostrarCarritos = require("./Static/mostrarCarritos.js");
const crearCarrito = require("./Static/crearCarrito.js");
const eliminarCarrito = require("./Static/eliminarCarrito.js");
const generarPedido = require("./Static/generarPedido.js");
const seleccionarSucursal = require("./Static/seleccionarSucursal.js");
const ingresarDireccion = require("./Static/ingresarDireccion.js");
const crearUsuarioCliente = require("./Static/crearUsuario.js");
require('dotenv').config();
const cors = require('cors');
const buscarUsuario = require("./Static/buscarUsuario.js");
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET;


const app = express();

app.use(cors());
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
MOSTRAR CARRITOS
---------------------
*/

app.get('/mostrarCarritos', async (req,res) => {
  const {id_cliente} = req.body;

  carrito = await mostrarCarritos(id_cliente);


  console.log(carrito);
  
  res.send(carrito)

});

/*
---------------------
CREAR CARRITO
---------------------
*/

app.post('/crearCarrito', async (req,res) => {
  const { id_cliente } = req.body;

  const result = await crearCarrito(id_cliente);

  res.send(result); 
});

/*
---------------------
ELIMINAR CARRITO
---------------------
*/

app.delete('/eliminarCarrito', async (req,res) => {
  const { id_carrito } = req.body;

  const result = await eliminarCarrito(id_carrito);

  res.send(result); 
});

/*
---------------------
VER EL CARRITO
---------------------
*/

app.get('/devolverProductosCarrito', async (req,res) => {
  const { id_carrito } = req.body;

  const contenido = await devolverProductosCarrito(id_carrito);

  res.send(contenido); 
});

/*
---------------------
AGREGAR AL CARRITO
---------------------
*/

app.post('/agregarCarrito', async (req,res) => {
  const {id_carrito, id_producto, cantidad, id_tipo_cliente} = req.body;


  agregar = await agregarCarrito(id_carrito,id_producto,cantidad,id_tipo_cliente);

  console.log(id_carrito);
  console.log(agregar);

  if (agregar) {
    res.send('Producto agregado con exito');
  } else {
    res.send('Algo salió mal: '+ agregar.error);
  }
});

/*
---------------------
QUITAR DEL CARRITO
---------------------
*/

app.delete('/rebajarCarrito', async (req,res) => {
  const {id_carrito, id_producto, cantidad} = req.body;

  rebaja = await rebajarCarrito(id_carrito, id_producto,cantidad);

  if (rebaja) {
    res.status(200).json({success:true,mensaje:'Producto rebajado con exito'});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

app.post('/generarPedido', async (req,res) => {
  const {id_carrito} = req.body;

  pedido = await generarPedido(id_carrito);
  if (pedido) {
    res.status(200).json({success:true,mensaje:'Pedido realizado con exito'});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

app.post('/ingresarDireccion', async (req,res) => {
  const {id_pedido,direccion} = req.body;

  despacho = await ingresarDireccion(id_pedido,direccion);
  if (despacho) {
    res.status(200).json({success:true,mensaje:'Dirección del pedido ingresada exitosamente'});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

app.post('/crearUsuario', async (req,res) => {
  const {   email,
            contrasena,
            nombre,
            rut,
            telefono,
            direccion,
            id_tipo_cliente, } = req.body;

  const result = await crearUsuarioCliente(email,contrasena,1,nombre,rut,telefono,direccion,id_tipo_cliente);
  console.log(result);
  res.send(result); 
});

app.post('/buscarUsuario',async (req,res) => {
  const { email, contrasena } = req.body;

  result = await buscarUsuario(email,contrasena);

  if (result.success) {
    const token = jwt.sign({ email: email, id: result.id_usuario }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(404).json({success:result.success, mensaje:'Credenciales no encontradas'});
  }
});

app.listen(3000, `${process.env.IP}`, () => {
  console.log('Servidor accesible desde red local en el puerto 3000');
});

console.log(`El servidor esta en linéa en el puerto ${3000}`)

