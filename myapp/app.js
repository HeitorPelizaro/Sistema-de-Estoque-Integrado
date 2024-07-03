require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Altere para true se estiver usando HTTPS
}));

// Middleware para verificar se o usuário está logado
const redirectToLogin = (req, res, next) => {
    if (req.session.user) {
        next(); // Se o usuário estiver autenticado, passa para a próxima rota
    } else {
        res.redirect('/login'); // Caso contrário, redireciona para a página de login
    }
};

// Rota para renderizar a página de login
app.get('/login', (req, res) => {
    res.render('index');
});

// Rota para processar o login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.user = user;
                    res.redirect('/dashboard');  // Redirecionar para o dashboard após login bem-sucedido
                } else {
                    res.send('Email ou senha incorretos!');
                    res.redirect('/index');
                }
            });
        } else {
            res.send('Email ou senha incorretos!');
        }
    });
});


// Rota para renderizar o dashboard
app.get('/dashboard', redirectToLogin, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});
// Rota para renderizar a página de importação
app.get('/importar', redirectToLogin, (req, res) => {
    res.render('importar', { user: req.session.user }); // Passando a variável 'user' para o modelo
});
// Rota para renderizar a página de importação
app.get('/inserir', redirectToLogin, (req, res) => {
    res.render('inserir', { user: req.session.user }); // Passando a variável 'user' para o modelo
});
// Rota para renderizar a página de exportação
app.get('/exportar', redirectToLogin, (req, res) => {
    res.render('exportar', { user: req.session.user });
});


// Rota para processar a importação de dados
app.post('/importar', redirectToLogin, (req, res) => {
    const dados = req.body.dados;

    // Verificar se req.body.dados está definido
    if (dados !== undefined) {
        // Dividir os dados em linhas
        const linhas = dados.split('\n');

        // Loop através das linhas e inserir no banco de dados
        linhas.forEach((linha) => {
            const [codigo_de_barras, descricao] = linha.split(';');
            const sql = 'INSERT INTO produtos (codigo_de_barras, descricao) VALUES (?, ?)';
            db.query(sql, [codigo_de_barras.trim(), descricao.trim()], (err, result) => {
                if (err) {
                    console.error('Erro ao inserir dados:', err);
                } else {
                    console.log('Dados inseridos com sucesso!');
                }
            });
        });

        // Após processar os dados, você pode redirecionar o usuário para uma página de sucesso
        res.redirect('/dashboard');
    } else {
        // Se req.body.dados estiver indefinido, envie uma mensagem de erro
        console.error('Dados não recebidos');
        res.status(400).send('Dados não recebidos');
    }
});

// Rota para renderizar a página de estoque
app.get('/estoque', redirectToLogin, (req, res) => {
    const sql = 'SELECT id, codigo_de_barras, descricao, quantidade FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos do estoque');
        } else {
            res.render('estoque', { produtos: results, user: req.session.user });
        }
    });
});
// Rota para processar a exportação de todos os produtos
app.post('/exportar', redirectToLogin, (req, res) => {
    // Consulta SQL para obter todos os produtos
    const sql = 'SELECT * FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao exportar produtos:', err);
            res.status(500).send('Erro ao exportar produtos.');
        } else {
            // Formatar os dados como desejado (por exemplo, CSV)
            const csvData = formatDataAsCSV(results);

            // Definir os cabeçalhos da resposta para indicar um arquivo CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="produtos_exportados.csv"');

            // Enviar os dados formatados como resposta
            res.send(csvData);
        }
    });
});

// Função para formatar os dados como CSV
function formatDataAsCSV(data) {
    let csv = 'ID,Código de Barras,Descrição,Quantidade\n';
    data.forEach(product => {
        csv += `${product.id},${product.codigo_de_barras},"${product.descricao}",${product.quantidade}\n`;
    });
    return csv;
}




// Rota para processar a inserção de um novo produto
app.post('/inserir', redirectToLogin, (req, res) => {
    // Extrair os dados do corpo da requisição
    const { codigo_de_barras, descricao, quantidade } = req.body;

    // Verificar se todos os campos foram fornecidos
    if (!codigo_de_barras || !descricao || !quantidade) {
        return res.status(400).send('Por favor, forneça todos os campos necessários.');
    }

    // Consulta SQL para inserir um novo produto na tabela produtos
    const sql = 'INSERT INTO produtos (codigo_de_barras, descricao, quantidade) VALUES (?, ?, ?)';
    
    // Executar a consulta SQL com os dados fornecidos
    db.query(sql, [codigo_de_barras, descricao, quantidade], (err, result) => {
        if (err) {
            console.error('Erro ao inserir produto:', err);
            res.status(500).send('Erro ao inserir produto na tabela.');
        } else {
            console.log('Produto inserido com sucesso!');
            res.redirect('/inserir'); // Redirecionar para a página de estoque após a inserção bem-sucedida
        }
    });
});



// Rota para fazer logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login'); // Redireciona para a página de login após o logout
        }
    });
});


// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
