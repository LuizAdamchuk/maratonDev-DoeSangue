// configurando o servidor
const express = require("express")
const server = express()

//configurar o servidor para exibir arquivos extra
// nesse caso criamos a pasta public e colocamos
// todos os arquivos estatiso ali dentro
server.use(express.static('public'))

// para pegar os dados do formulario com o req precisamos dar mais poder ao express
// com esse comando ele passa a ter isso 
server.use(express.urlencoded({
    extended: true
}))

// fazendo a ligação usando o pg(npm install pg), o .Pool significa o tipo de conexao q se mantera
// com o banco de dados no caso sera continua nao exigindo colocar usuario e senha varias vezes
// foi necessario passar todas os dados para acessar o banco de dados, inclusive o nome que criamos
// para o banco
const Pool = require("pg").Pool
const db = new Pool({
    user: 'postgres',
    password: 'alfamek123',
    host: 'localhost',
    port: 5432,
    database: 'doe'

})



// configurando o template engine
// isso permite o envio de dados para o html
const nunjucks = require("nunjucks")
// aqui primeiro passa o caminho de onde esta o projeto, cria-se o objeto e diz qual o nome 
// que seu express recebeu, no caso demos o nome do express de server
nunjucks.configure("./", {
    express: server,
    noCach: true
})

// configurar a apresentação da pagina
// mudar a ordem do req e res faz diferença
// seria a formulação da routes?
server.get('/', function (req, res) {
    // aqui eu passei a acessar o banco de dados, entao como instanciei na const db, uso o comando
    // query e passo os parametros q configurei la no back-end, usando o programa do postbird
    // essa query retorna 2 parametros, o erro e o resultado, para pegarmos o conteudo do banco de dados
    // usamos o comando result.rows e colocamos em uma variavel e passamos para renderizar como um
    // objeto
    db.query("SELECT * FROM donors", function (err, result) {

        if (err) return res.send("Erro no banco de dados.")

        const donors = result.rows

        return res.render("index.html", {
            donors
        })
    })


})
server.post('/', function (req, res) {
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.blood

    // aqui fazemos uma verificacao para que nao seja enviado ao banco de dados um formulario
    // sem todos os dados necessarios
    if (name == '' || email == '' || blood == '') {
        return res.send("Todos os campos são obrigatórios.")
    }
    // colocando valores dentro do banco de dados
    // essa query passa a receber a configuração que fizemos no banco de dados atraves do postbird
    // essas regras foram feitas no backend
    const query = `
    INSERT INTO donors ("name", "email", "blood")
    VALUES ($1, $2, $3)`
    // no uso do $1, $2, $3 passamos uma forma de receber o parametro posteriormente, no caso passamos
    // pelo array logo abaixo com [nome, email, blood]
    db.query(query, [name, email, blood], function (err) {
        // aqui fazemos uma verificacao caso ocorro algum erro esta msg irá aparecer
        if (err) return res.send("Erro no banco de dados.")
        // entao apos adicionar os valores no banco de dados a pg é redirecioanda para a primeira pg
        return res.redirect('/')
    })

})


// ligar o servidor e permitir o acesso na porta 3000
server.listen(3000)