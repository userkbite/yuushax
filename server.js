const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const session = require('express-session');
const { v4:uuidv4 } = require('uuid');

const router = require('./router');
const mongoose = require('mongoose');

const mongo_uri = 'mongodb+srv://admin:admin123@cluster0.1h72v.mongodb.net/yuushax?retryWrites=true&w=majority'

mongoose.connect(mongo_uri, function(err) {
    if (err) {
        throw err;
    } else {
        console.log(`Successfully connected to ${mongo_uri}`);
    }
})

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}))

app.set('view engine', 'ejs');

//load static assets/styles
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use('/route', router);

//home route
app.get('/', (req, res) => {
    if(req.session.user) return res.redirect('/home');
    res.render('index', { title: 'Yuushax'});
});

app.get('/register', (req, res) => {
    if(req.session.user) return res.redirect('/home');
    res.render('register', { title: 'Yuushax - Cadastro'});
});

app.get('/home', (req, res) => {
    if(!req.session.user) return res.redirect('/');
    res.render('home', { title: 'Yuushax - Home' });
})

app.get('*', (req, res) => {
    if(req.session.user) return res.redirect('/home');
    res.render('404', { title: '404' });
});

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
})