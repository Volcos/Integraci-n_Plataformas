let getConnection = require('./db.js')
const OracleDB = require('oracledb');
/*
async function obtenerPedidoPorToken(token) {
  const db = await getConnection();
  const result = await db.execute(
    `SELECT ID_PEDIDO FROM pedido WHERE id_pedido = :token`,
    { token },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows[0]?.ID_PEDIDO;
}*/
async function obtenerDireccionPorPedido(idPedido) {
  const db = await getConnection();
  const result = await db.execute(
    `SELECT * FROM despacho WHERE ID_PEDIDO = :idPedido`,
    { idPedido },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows[0];
}
async function obtenerProductosPorPedido(idPedido) {
  const db = await getConnection();
  const result = await db.execute(
    `SELECT p.NOMBRE, d.CANTIDAD, d.PRECIO_UNITARIO
     FROM detalle_pedido d
     JOIN productos p ON p.ID_PRODUCTO = d.ID_PRODUCTO
     WHERE d.ID_PEDIDO = :idPedido`,
    { idPedido },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows;
}
async function obtenerTotalPedido(idPedido) {
  const db = await getConnection();
  const result = await db.execute(
    `SELECT SUM(CANTIDAD * PRECIO_UNITARIO) AS TOTAL
     FROM detalle_pedido
     WHERE ID_PEDIDO = :idPedido`,
    { idPedido },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows[0]?.TOTAL;
}
module.exports = {
  //obtenerPedidoPorToken,
  obtenerDireccionPorPedido,
  obtenerProductosPorPedido,
  obtenerTotalPedido
};
