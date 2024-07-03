require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Configuração do MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

const email = 'iury_ls@hotmail.com';
const password = '123456';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hash], (err, result) => {
        if (err) throw err;

        console.log('Usuário adicionado com sucesso!');
        db.end();
    });
});
