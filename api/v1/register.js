const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')





// EXPRESS FUNCTIONS

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: 'GET, POST, PUT'
}));


// CONNECTION WITH DATABASE

const db = mysql.createPool({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'b17e1ac05ee43a',
    password: 'de0e2b90',
    database: 'heroku_3ca6c256ecb0fd5'
})



// SESSION CONFIGURATIONS

const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(
    session({
        key: 'userId',
        secret: 'user',
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 60 * 24
        }
    })
)

// LISTENING PORT

app.listen(process.env.PORT || 3001, () => {
    console.log('Runnin on port 3001');
})


// SALTROUNDS FOR HASHING PASSWORD

const SaltRounds = 10;



//REGISTER

app.post('/api/v1/register/registerUser', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const url = req.body.url;

    if (password == confirmPassword) {
        bcrypt.hash(password, SaltRounds, (err, hash) => {
            if (err) {
                console.log(err)
            }
        
        db.query(
    
                "INSERT INTO users (name, email, password, photo_url) VALUES (?,?,?,?)",
                [name, email, hash, url],
                (err, result) => {
                    if (result) {
                    console.log(result)
                    res.send({message: "O usuário foi cadastrado!"})
                    } else {
                    res.send({message: "Deu ruim"})
                    }
                }
            )
        })
    } else {
        res.send({message: "Senha e confirmar senha estão diferentes!"})
    }

    
})

// REGISTER DONATION

app.post('/api/v1/register/registerdonate', (req, res) => {
    const name = req.body.itemName;
    const setor = req.body.setor;
    const cidade = req.body.cidade;
    const imagem = req.body.imagem;
    const description = req.body.description;
    const phone = req.body.phone;
    const condition = req.body.condition;


    const sqlINSERT = "INSERT INTO donates (name, setor, city, images, description, phone, condicao) VALUES (?,?,?,?,?,?,?)"

    db.query(sqlINSERT, [name,setor,cidade,imagem,description,phone,condition], (err, result) => {
        if (err){
            res.send({message: "deu ruim"})
        } else {
            res.send({message: 'Item cadastrado com sucesso!'})
        }
        
    })

    
})



// LOGIN SYSTEM


app.post('/api/v1/register/login', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        login,
        (error, result) => {
            if (error) {
                res.send({ error: error })
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        res.send(result)
                    } else {
                        res.send({message: "Login ou senha incorretos!"})
                    }
                })
            } else {
                res.send({message: "Usuário não encontrado"})
            }
        }
    )
})

app.get('/api/v1/register/login', (req, res) => {
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn: false})
    }
})


// SEND DONATIONS TO FRONTEND

app.get('/api/v1/donations/getdonations', (req, res) => {
    const sqlSELECT = "SELECT * FROM donates"

    db.query(sqlSELECT, (err, result) =>{
        res.send(result);
    })
})

