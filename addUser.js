require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

/**
 * Configuração do MySQL
 * 
 * Utiliza as variáveis de ambiente definidas no arquivo .env
 * para conectar ao banco de dados MySQL.
 */
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

/**
 * Conectar ao banco de dados
 * 
 * Tenta conectar ao banco de dados e lança um erro se não for possível.
 */
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

/**
 * Dados do usuário a ser adicionado
 * 
 * Exemplo de dados de um usuário a ser adicionado ao banco de dados.
 */
const email = 'gustavo@hotmail.com';
const password = '123456';
const nome = 'Gustavo';

/**
 * Hash da senha do usuário
 * 
 * Utiliza o algoritmo de hash bcrypt para criptografar a senha do usuário.
 * O segundo parâmetro (10) define o número de rounds de hash.
 */
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    /**
     * Query de inserção do usuário
     * 
     * Insere os dados do usuário no banco de dados, utilizando a senha hashada.
     */
    const sql = 'INSERT INTO users (email, password, nome) VALUES (?, ?, ?)';
    db.query(sql, [email, hash, nome], (err, result) => {
        if (err) throw err;

        console.log('Usuário adicionado com sucesso!');
        db.end(); // Fecha a conexão com o banco de dados
    });
});