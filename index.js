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
const jwt = require('jsonwebtoken');
const borrarDelCarrito = require("./Static/borrarDelCarrito.js");
const SECRET = process.env.JWT_SECRET;
const { WebpayPlus, Options, IntegrationApiKeys, Environment } = require('transbank-sdk');
const { obtenerPedidoPorToken, obtenerDireccionPorPedido, obtenerProductosPorPedido, obtenerTotalPedido } = require('./Static/pedidos.js');
const { autoCommit } = require("oracledb");
const webpayTransaction = require("./Static/transbank.js");


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
CONSULTAR INVENTARIO
---------------------
*/ 

app.get('/inventario', async (req, res) => {
  try {
    const db = await getConnection();
    const result = await db.execute(`
      SELECT  i.id_producto, 
              p.nombre, 
              p.stock_minimo,
              s.id_sucursal AS id_sucursal, 
              i.cantidad
      FROM inventario i
      JOIN producto p ON i.id_producto = p.id_producto
      JOIN sucursal s ON i.id_sucursal = s.id_sucursal
      ORDER BY i.id_producto
    `);

    const productos = {};
    result.rows.forEach(row => {
      const [id, nombre, minStock, sucursal, cantidad] = row;
      if (!productos[id]) {
        productos[id] = {
          id,
          name: nombre,
          minStock,
          stockByBranch: {}
        };
      }
      productos[id].stockByBranch[sucursal] = cantidad;
    });

    res.json(Object.values(productos));
  } catch (e) {
    res.status(500).send('Error al obtener inventario: ' + e.message);
  }
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
  const {id_cliente} = req.query;

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
  console.log(result);
  res.send(result); 
});

/*
---------------------
VER EL CARRITO
---------------------
*/

app.get('/devolverProductosCarrito', async (req,res) => {
  const { id_carrito } = req.query;

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
/*
---------------------
BORRAR DEL CARRITO
---------------------
*/
app.delete('/borrarDelCarrito', async (req,res) => {
  const {id_carrito, id_producto} = req.body;

  result = await borrarDelCarrito(id_carrito,id_producto);

  if (result) {
    res.status(200).json({success:true,mensaje:'Producto eliminado con exito'});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

/*
---------------------
GENERAR PEDIDO
---------------------
*/

app.post('/generarPedido', async (req,res) => {
  const {id_carrito} = req.body;

  pedido = await generarPedido(id_carrito);

  console.log(pedido)
  if (pedido.success) {
    res.status(200).json({success:true,mensaje:'Pedido realizado con exito',id_pedido:pedido.id_pedido});
  } else {
    res.status(404).json({success:false, mensaje:'Algo salió mal'})
  }
});

/*
---------------------
INGRESAR DIRECCION
---------------------
*/

app.post('/ingresarDireccion', async (req,res) => {
  const {id_pedido,direccion} = req.body;

  despacho = await ingresarDireccion(id_pedido,direccion);
  if (despacho.success) {
    res.status(200).json({success:true,mensaje:'Dirección del pedido ingresada exitosamente'});
  } else {
    res.status(404).json({success:false, mensaje:despacho.error});
  }
});

/*
---------------------
CREAR USUARIO
---------------------
*/

app.post('/crearUsuario', async (req,res) => {
  const {   email,
            contrasena,
            nombre,
            rut,
            telefono,
            direccion,
            id_tipo_cliente, } = req.body;
  console.log(id_tipo_cliente);
  const result = await crearUsuarioCliente(email,contrasena,1,nombre,rut,telefono,direccion,id_tipo_cliente);
  console.log(result);
  res.send(result); 
});

/*
---------------------
BUSCAR USUARIO
---------------------
*/

app.post('/buscarUsuario',async (req,res) => {
  const { email, contrasena } = req.body;
  console.log(email)
  console.log(contrasena)
  result = await buscarUsuario(`${email}`,`${contrasena}`);
  
  if (result.success) {
    const token = jwt.sign({ email: email, id: result.id_usuario, id_tipo_cliente:result.id_tipo_cliente, id_cliente: result.id_cliente }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(404).json({success:result.success, mensaje:result.e});
  }
});

/*
---------------------
REALIZAR PAGO
---------------------
*/
app.post('/pagar', async (req, res) => {
  try {
    const { id_compra, id_usuario, monto_total } = req.body;


    const returnUrl = 'http://localhost:5173/retorno-webpay';

    const response = await webpayTransaction.create(
      String(id_compra),
      String(id_usuario),
      monto_total,
      returnUrl
    );

    const { token, url } = response;

    const htmlForm = `
      <html>
        <body onload="document.forms[0].submit()">
          <form action="${url}" method="POST">
            <input type="hidden" name="token_ws" value="${token}" />
            <noscript>
              <input type="submit" value="Ir a pagar con Webpay" />
            </noscript>
          </form>
        </body>
      </html>
    `;

    res.send(htmlForm);
  } catch (error) {
    console.error('Error en /pagar:', error);
    res.status(500).json({ success: false, message: 'Error al crear la transacción', error: error.message });
  }
});

/*
---------------------
RESPUESTA WEBPAY
---------------------
*/

app.post('/retorno-webpay', express.urlencoded({ extended: false }),async (req, res) => {
  const token = req.body.token_ws;

  try {
    const result = await webpayTransaction.commit(token);

    if (result.response_code === 0) {
      const info = {
        order: result.buy_order,
        session: result.session_id,
        amount: result.amount,
        cardDetail: result.card_detail,
        authorizationCode: result.authorization_code,
        paymentType: result.payment_type_code,
        installments: result.installments_number,
      };

      console.log('Pago exitoso:', info);

      res.json(
          {
            success:true,
            token_ws:token,
            result:info
          }
      );
    } else {
      res.send(
          {
            success:false,
          }
        );
    }
  } catch (error) {
    console.error('Error al obtener resultado de transacción:', error);
    res.status(500).send('Error en la confirmación del pago.');
  }
});

/*
---------------------
ESTADO DE LA COMPRA Y CONSULTA DE DATOS
---------------------
*/ 

app.get('/pedido-exito', async (req, res) => {
  const { token } = req.query; // token = id_pedido
  const db = await getConnection();

  try {
    const pedidoId = parseInt(token);

    const direccionResult = await db.execute(`
      SELECT DIRECCION
      FROM DESPACHO
      WHERE ID_PEDIDO = :id
    `, [pedidoId]);

    const direccion = direccionResult.rows[0]?.[0] || 'Sin dirección registrada';

    const productosResult = await db.execute(`
      SELECT NOMBRE, PRECIO_UNITARIO, CANTIDAD
      FROM DETALLE_PEDIDO
      WHERE ID_PEDIDO = :id
    `, [pedidoId]);

    const productos = productosResult.rows.map(row => ({
      name: row[0],
      price: row[1],
      quantity: row[2]
    }));

    const totalResult = await db.execute(`
      SELECT MONTO_TOTAL
      FROM RECIBO
      WHERE ID_PEDIDO = :id
    `, [pedidoId]);

    const total = totalResult.rows[0]?.[0] || 0;

    res.json({
      id_pedido: pedidoId,
      direccion,
      productos,
      total
    });

  } catch (e) {
    console.error('Error en /pedido-exito:', e);
    res.status(500).send('Error al recuperar datos del pedido');
  }
});

/*
---------------------
ESTABLECER UN STOCK FIJO PARA LOS PRODUCTOS DEL CARRITO
---------------------
*/ 

app.put('/setCantidad', async (req,res)  => {
  const { id_carrito, id_producto, cantidad } = req.body;
  console.log("request: "+req.body.id_carrito)
  console.log(id_carrito);
  console.log(id_producto);
  console.log(cantidad);
  try {
    db = await getConnection();
    await db.execute(`
         UPDATE CARRITO_ITEM 
         SET CANTIDAD = :cantidad 
         WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
        {
          cantidad,
          id_carrito,
          id_producto
         }
        ) 
    await db.commit();
    res.status(200).json({success:true,message:'Cantidad actualizada con exito'})
  } catch (e){
    console.log(e)
    return res.status(400).json({success:false,message:e})
  }

})

app.listen(3000, `${process.env.IP}`, () => {
  console.log('Servidor accesible desde red local en el puerto 3000');
});

console.log(`El servidor esta en linéa en el< puerto ${3000}`)

