/**
* Importa o módulo dotenv para carregar variáveis de ambiente
*/
require('dotenv').config();

/**
* Importa o framework Express para criar a aplicação web
*/
const express = require('express');

/**
* Importa o driver MySQL2 para se conectar ao banco de dados
*/
const mysql = require('mysql2');

/**
* Importa o middleware Body-Parser para parsear requisições HTTP
*/
const bodyParser = require('body-parser');

/**
* Importa o módulo Bcrypt para criptografar senhas
*/
const bcrypt = require('bcryptjs');

/**
* Importa o middleware Express-Session para gerenciar sessões de usuário
 */
const session = require('express-session');

const flash = require('connect-flash');

/**
* Cria uma instância da aplicação Express
*/
const app = express();

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(flash());

// Middleware para tornar as mensagens flash disponíveis nas views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

/**
* Define a porta padrão para a aplicação (ou usa a porta definida na variável de ambiente PORT)
*/
const port = process.env.PORT || 3000;

/**
* Configuração do banco de dados MySQL
* 
* As variáveis de ambiente DB_HOST, DB_USER, DB_PASSWORD e DB_NAME devem ser definidas
* em um arquivo .env para que a aplicação possa se conectar ao banco de dados
*/
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

/**
 * Conecta ao banco de dados MySQL
 * 
 * Se houver um erro durante a conexão, lança uma exceção
 * Caso contrário, imprime uma mensagem de sucesso na console
 */
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

/**
 * Middleware para parsear os dados do formulário em formato URL-encoded
 */
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Servir arquivos estáticos da pasta 'public'
 */
app.use(express.static('public'));

/**
 * Definir o motor de template como EJS
 */
app.set('view engine', 'ejs');

/**
 * Configurar sessões com secret key e opções de segurança
 */
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Configuração para usar cookies seguros em produção
}));

/**
 * Middleware para verificar se o usuário está logado
 * Se o usuário estiver logado, permite que o próximo middleware seja executado
 * Caso contrário, redireciona para a página de login
 */
const redirectToLogin = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        res.redirect('/login'); 
    }
};

/**
 * Renderizar a página de login
 */
app.get('/login', (req, res) => {
    res.render('index');
});


/**
 * Processar o login
 * Verifica se o email e senha estão corretos e, se sim, loga o usuário
 */
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email =?';
    db.query(sql, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.user = user;
                    res.redirect('/dashboard');  
                } else {
                    req.flash('error_msg', 'Email ou senha incorretos!');
                    res.redirect('/login');
                }
            });
        } else {
            req.flash('error_msg', 'Email ou senha incorretos!');
            res.redirect('/login');
        }
    });
});


/**
 * Renderiza a página de dashboard do usuário.
 * 
 
*/
app.get('/dashboard', redirectToLogin, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

/**
 * Renderiza a página de importação de dados.
 * 

*/
app.get('/importar', redirectToLogin, (req, res) => {
    res.render('importar', { user: req.session.user }); 
});

/**
 * Renderiza a página de exportação de dados.
 * 

*/
app.get('/exportar', redirectToLogin, (req, res) => {
    res.render('exportar', { user: req.session.user });
});

app.get('/tutorial', redirectToLogin, (req, res) => {
    res.render('tutorial', { user: req.session.user });
});
app.get('/inserir', redirectToLogin, (req, res) => {
    const successMessage = req.query.success ? 'Produto adicionado com sucesso!' : null;
    const errorMessage = req.query.error || null;
    res.render('inserir', { user: req.session.user, successMessage, errorMessage });
});


/**
 * Rota para processar a importação de dados
 * 
 * Esta rota é responsável por processar a importação de dados enviados pelo cliente.
 * Ela espera que os dados sejam enviados no corpo da requisição em formato de texto,
 * onde cada linha representa um produto com informações separadas por ponto e vírgula (;).
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */





/**
 * Rota para renderizar a página de estoque
 * 
 * Esta rota é responsável por renderizar a página de estoque, 
 * onde são listados todos os produtos cadastrados no banco de dados.
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
app.get('/estoque', redirectToLogin, (req, res) => {
    const sql = 'SELECT id, codigo_de_barras, descricao, quantidade FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos do estoque');
        } else {
            /**
             * Renderiza a página de estoque com a lista de produtos
             * 
             * @param {String} 'estoque' - Nome da página a ser renderizada
             * @param {Object} { produtos: results, user: req.session.user } - Dados a serem passados para a página
             */
            res.render('estoque', { produtos: results, user: req.session.user });
        }
    });
});

/**
 * Rota para processar a exportação de todos os produtos
 * 
 * Esta rota é responsável por exportar todos os produtos cadastrados no banco de dados
 * em formato CSV.
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
app.post('/exportar', redirectToLogin, (req, res) => {
    
    const sql = 'SELECT * FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao exportar produtos:', err);
            res.status(500).send('Erro ao exportar produtos.');
        } else {
            /**
             * Formata os dados em formato CSV
             * 
             * @param {Array} results - Lista de produtos
             * @return {String} - Dados em formato CSV
             */
            const csvData = formatDataAsCSV(results);

            /**
             * Configura os headers da resposta para download do arquivo CSV
             */
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="produtos_exportados.txt"');
            
            /**
             * Envia o arquivo CSV para download
             */
            res.send(csvData);
        }
    });
});
/**
 * Função para formatar os dados como CSV
 * 
 * @param {array} data - Array de objetos com informações dos produtos
 * @returns {string} - String contendo os dados formatados como CSV
 */
function formatDataAsCSV(data) {
    let csv = 'ID,Código de Barras,Descrição,Quantidade\n';
    data.forEach(product => {
        csv += `${product.id},${product.codigo_de_barras},"${product.descricao}",${product.quantidade}\n`;
    });
    return csv;
}

/**
 * Rota para renderizar a página de escaneamento
 * 
 * @param {object} req - Requisição HTTP
 * @param {object} res - Resposta HTTP
 */
app.get('/scan', redirectToLogin, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); 
    }
    /**
     * Renderiza a página de escaneamento com os dados do usuário e sem produto ou código de barras
     */
    res.render('scan', { user: req.session.user, product: null, barcode: null });
});

/**
 * Rota para processar a submissão do código de barras
 * 
 * @param {object} req - Requisição HTTP
 * @param {object} res - Resposta HTTP
 */
app.post('/scan', redirectToLogin, (req, res) => {
    const { barcode } = req.body;

    const sql = 'SELECT * FROM produtos WHERE codigo_de_barras = ?';
    db.query(sql, [barcode], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.status(500).send('Erro ao buscar produto');
        }

        if (results.length > 0) {
            const product = results[0];
            /**
             * Renderiza a página de escaneamento com os dados do usuário e do produto encontrado
             */
            res.render('scan', { user: req.session.user, product, barcode: null });
        } else {
            /**
             * Renderiza a página de escaneamento com os dados do usuário e sem produto, mas com o código de barras
             */
            res.render('scan', { user: req.session.user, product: null, barcode });
        }
    });
});


/**
 * Rota para adicionar um novo produto
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * 
 * @description Adiciona um novo produto ao banco de dados com os dados fornecidos no corpo da requisição.
 */
app.post('/adicionar-produto', redirectToLogin, (req, res) => {
    const { barcode, descricao, quantidade } = req.body;

    const sql = 'INSERT INTO produtos (codigo_de_barras, descricao, quantidade) VALUES (?,?,?)';
    db.query(sql, [barcode, descricao, parseInt(quantidade)], (err, result) => {
        if (err) {
            console.error('Erro ao inserir produto:', err);
            return res.status(500).send('Erro ao inserir produto');
        }
        res.redirect('/scan');
    });
});

/**
 * Rota para atualizar um produto existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * 
 * @description Atualiza um produto existente no banco de dados com os dados fornecidos no corpo da requisição.
 */
app.post('/atualizar-produto', redirectToLogin, (req, res) => {
    const { id, descricao, quantidade } = req.body;

    const sql = 'UPDATE produtos SET descricao =?, quantidade =? WHERE id =?';
    db.query(sql, [descricao, parseInt(quantidade), id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            return res.status(500).send('Erro ao atualizar produto');
        }
        res.redirect('/scan');
    });
});



// Rota de importação
app.post('/importar', (req, res) => {
    const dados = req.body.dados;

    // Função para validar os dados
    function validarDados(dados) {
        const linhas = dados.trim().split('\n');
        return linhas.every(linha => {
            const partes = linha.split(';');
            return partes.length === 3 && partes.every(parte => parte.trim() !== '');
        });
    }

    const importSuccessful = validarDados(dados);

    if (importSuccessful) {
        // Lógica para importar os dados
        const linhas = dados.trim().split('\n');
        let countProcessed = 0;

        const processarLinha = (linha) => {
            return new Promise((resolve, reject) => {
                const dadosProduto = linha.split(';');

                if (dadosProduto.length === 3) {
                    const codigo_de_barras = dadosProduto[0].trim();
                    const descricao = dadosProduto[1].trim();
                    const quantidade = parseInt(dadosProduto[2].trim());

                    const checkSql = 'SELECT * FROM produtos WHERE codigo_de_barras = ?';
                    db.query(checkSql, [codigo_de_barras], (err, results) => {
                        if (err) {
                            console.error('Erro ao verificar produto:', err);
                            return reject(err);
                        }

                        if (results.length > 0) {
                            // Produto já existe, atualizar a quantidade
                            const existingProduct = results[0];
                            const newQuantity = existingProduct.quantidade + quantidade;

                            const updateSql = 'UPDATE produtos SET quantidade = ? WHERE id = ?';
                            db.query(updateSql, [newQuantity, existingProduct.id], (err, result) => {
                                if (err) {
                                    console.error('Erro ao atualizar quantidade:', err);
                                    return reject(err);
                                }
                                resolve();
                            });
                        } else {
                            // Produto não existe, prosseguir com a inserção
                            const insertSql = 'INSERT INTO produtos (codigo_de_barras, descricao, quantidade) VALUES (?, ?, ?)';
                            db.query(insertSql, [codigo_de_barras, descricao, quantidade], (err, result) => {
                                if (err) {
                                    console.error('Erro ao inserir produto:', err);
                                    return reject(err);
                                }
                                resolve();
                            });
                        }
                    });
                } else {
                    resolve(); // Resolva a promise mesmo com erro de formato
                }
            });
        };

        Promise.all(linhas.map(processarLinha))
            .then(() => {
                req.flash('success_msg', 'Produtos importados com sucesso!');
                req.flash('error_msg', ''); // Limpa a mensagem de erro
                res.redirect('/importar'); // Redireciona para a página de importação
            })
            .catch((err) => {
                console.error('Erro ao processar dados:', err);
                req.flash('error_msg', 'Erro ao importar produtos. Tente novamente.');
                req.flash('success_msg', ''); // Limpa a mensagem de sucesso
                res.redirect('/importar'); // Redireciona para a página de importação
            });
    } else {
        req.flash('error_msg', 'Erro ao importar produtos. Verifique os dados e tente novamente.');
        req.flash('success_msg', ''); // Limpa a mensagem de sucesso
        res.redirect('/importar'); // Redireciona para a página de importação
    }
});


/**
 * Rota para inserir um produto via POST
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
app.post('/inserir', redirectToLogin, (req, res) => {
    /**
     * Obtém os dados do produto do corpo da requisição
     */
    const { codigo_de_barras, descricao, quantidade } = req.body;

    /**
     * Verifica se todos os campos necessários foram fornecidos
     */
    if (!codigo_de_barras ||!descricao ||!quantidade) {
        return res.redirect('/inserir?error=Por%20favor,%20forneça%20todos%20os%20campos%20necessários.');
    }

    /**
     * Verifica se o produto já existe no banco de dados
     */
    const checkSql = 'SELECT * FROM produtos WHERE codigo_de_barras =?';
    db.query(checkSql, [codigo_de_barras], (err, results) => {
        if (err) {
            console.error('Erro ao verificar o produto:', err);
            return res.redirect('/inserir?error=Erro%20ao%20verificar%20o%20produto%20no%20banco%20de%20dados.');
        }

        /**
         * Se o produto existir, atualiza a quantidade
         */
        if (results.length > 0) {
            const existingProduct = results[0];
            const newQuantity = existingProduct.quantidade + parseInt(quantidade);

            const updateSql = 'UPDATE produtos SET quantidade =? WHERE id =?';
            db.query(updateSql, [newQuantity, existingProduct.id], (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar quantidade:', err);
                    return res.redirect('/inserir?error=Erro%20ao%20atualizar%20quantidade%20do%20produto%20existente.');
                }
                console.log(`Quantidade atualizada para o produto com código de barras ${codigo_de_barras}`);
                return res.redirect('/inserir?success=true&message=Produto%20atualizado%20com%20sucesso!');
            });
        } else {
            /**
             * Se o produto não existir, insere um novo registro
             */
            const insertSql = 'INSERT INTO produtos (codigo_de_barras, descricao, quantidade) VALUES (?,?,?)';
            db.query(insertSql, [codigo_de_barras, descricao, quantidade], (err, result) => {
                if (err) {
                    console.error('Erro ao inserir produto:', err);
                    return res.redirect('/inserir?error=Erro%20ao%20inserir%20produto%20na%20tabela.');
                }
                console.log('Produto inserido com sucesso!');
                return res.redirect('/inserir?success=true&message=Produto%20adicionado%20com%20sucesso!');
            });
        }
    });
});

/**
 * Rota para fazer logout
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
app.get('/logout', (req, res) => {
    /**
     * Destroi a sessão do usuário
     */
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login'); 
        }
    });
});



/**
 * Inicializa o servidor e define a porta de escuta.
 * 
 * @param {number} port - Número da porta que o servidor irá escutar.
 */
app.listen(port, () => {
    /**
     * Função de callback executada quando o servidor estiver rodando.
     * Imprime uma mensagem no console indicando que o servidor está rodando.
     */
    console.log(`Servidor rodando em http://localhost:${port}`);
});