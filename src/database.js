import mysql from 'mysql2';
import dotenv from 'dotenv';


dotenv.config()
const connection = mysql.createConnection({
    host : process.env.hostBlk,
    user : process.env.userBlk,
    password : process.env.passwordBlk,
    database : process.env.databaseBlk,
    port : process.env.portBlk
});

connection.connect((err) =>{
    if(err){
        console.error('Error a conectar con la base de datos',err);
        return;
    }
    console.log('Conexion exitosa');
});

export default connection;