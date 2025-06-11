let getConnection = require('./db.js')
async function buscarUsuario(email,contrasena) {
    let db;
    try {
        db = await getConnection();
        const user = await db.execute(
            `
            SELECT ID_USUARIO,EMAIL,CONTRASENA FROM USUARIO WHERE EMAIL = :email AND CONTRASENA = :contrasena
            `,
            {
                email,
                contrasena
            }
        );
        console.log(user.rows.length);
        if (user.rows.length == 1){
            
            return {success: true, id_usuario: user.rows[0].id_usuario};
        } else {
            return {success:false};
        }
    } catch (e) {
        return e;
    }
}

module.exports = buscarUsuario;