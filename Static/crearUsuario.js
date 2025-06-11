const OracleDB = require('oracledb');
let getConnection = require('./db.js')

async function crearUsuarioCliente(
            email,
            contrasena,
            id_tipo_usuario,
            nombre,
            rut,
            telefono,
            direccion,
            id_tipo_cliente,
        ) {
    let db;
    try {
      db = await getConnection();

      let result  = await db.execute(
        `INSERT INTO USUARIO (email,contrasena,id_tipo_usuario) VALUES (:email,:contrasena,:id_tipo_usuario) RETURNING ID_USUARIO INTO :id_usuario`,
        { 
            email,
            contrasena,
            id_tipo_usuario,
            id_usuario: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER } 
        },
        { autoCommit:true }
      );
      console.log(result.outBinds.id_usuario[0]);
      await db.execute(
        `INSERT INTO CLIENTE (NOMBRE,RUT,TELEFONO,EMAIL,DIRECCION,ID_TIPO_CLIENTE,ID_USUARIO) VALUES (:nombre,:rut,:telefono,:email,:direccion,:id_tipo_cliente,:id_usuario)`,
        { 
            nombre,
            rut,
            telefono,
            email,
            direccion,
            id_tipo_cliente,
            id_usuario: result.outBinds.id_usuario[0] 
        },
        { autoCommit:true }
      );


      await db.commit();

      return result
    } catch (e) {
      return e
    }
    
}

module.exports = crearUsuarioCliente;