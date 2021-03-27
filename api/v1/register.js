const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')





// EXPRESS FUNCTIONS

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

app.use(cors(
    {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
))


// CONNECTION WITH DATABASE

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'doacao'
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
            expires: 60 * 60 * 24
        }
    })
)

// LISTENING PORT

app.listen(3001, () => {
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

    if (password == confirmPassword) {
        bcrypt.hash(password, SaltRounds, (err, hash) => {
            if (err) {
                console.log(err)
            }
        
        db.query(
    
                "INSERT INTO users (name, email, password) VALUES (?,?,?)",
                [name, email, hash],
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