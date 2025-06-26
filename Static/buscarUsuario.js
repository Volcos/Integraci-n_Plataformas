let getConnection = require('./db.js')
async function buscarUsuario(email,contrasena) {
    let db;
    try {
        db = await getConnection();
        const id_usuario = '';
        const user = await db.execute(
            `
            SELECT ID_USUARIO,EMAIL,CONTRASENA FROM USUARIO WHERE EMAIL = :email AND CONTRASENA = :contrasena
            `,
            {
                email,
                contrasena
            }
        );
        const tipo_cliente = await db.execute(
            `
            SELECT id_tipo_cliente,id_cliente FROM cliente WHERE id_usuario = :id_usuario
            `,
            {
                id_usuario:user.rows[0][0],
            }
        );
        console.log(id_usuario);
        console.log(tipo_cliente.rows);
        if (user.rows.length == 1){
            
            return {success: true, id_usuario: user.rows[0][0], id_tipo_cliente:tipo_cliente.rows[0][0], id_cliente:tipo_cliente.rows[0][1]};
        } 
    } catch (e) {
        console.log(e);
        return e;
    }
}

module.exports = buscarUsuario;