const express = require("express");
let getConnection = require('./db.js')

const app = express();

app.get('/empleados', async () =>{
    let db;
    try {
        db = await getConnection();
        const result = db.execute(`SELECT * FROM empleado`);
        console.log(result.rows);
    } catch (e) {
        result.status(500).send('Error al conectar: '+ e.message);
    }
})



app.listen(3000);
console.log(`El servidor esta en linéa en el puerto ${3000}`)