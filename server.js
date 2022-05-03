const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const session = require('express-session');
const { v4:uuidv4 } = require('uuid');

const router = require('./router');
const mongoose = require('mongoose');

const User = require('./user');

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

app.get('/home', async (req, res) => {
    if(!req.session.user) return res.redirect('/');
    let userAbout = await User.find({'email':req.session.user});
    userAbout.forEach(d => {
        req.session.name = d.username;
    });
    // console.log(req.session.name);
    res.render('home', { title: 'Yuushax - Home', username: req.session.name });
})

app.get('/discovery', async (req, res) => {
    if(!req.session.user) return res.redirect('/');

    const user = await User.findOne({'email':req.session.user});

    const users = await User.find({});

    res.render('discovery', { title: `Yuushax - Discovery`, users, user: user.username });
})

app.get('/:user', async (req, res) => {
    if(!req.session.user) return res.redirect('/');

    const user = await User.findOne({'email':req.session.user});

    let userId = req.params.user;
    
    let userAbout = await User.findOne({ username: userId });

    console.log(user);

    if(userAbout == null || userAbout == '') {
        res.render('404', { title: '404' });
    } else {
        res.render('profile', { title: `Perfil - ${userAbout.username}`, userAbout, user: user.username });
    }

})

app.get('/:user/follows', async (req, res) => {
    if(!req.session.user) return res.redirect('/');

    let userId = req.params.user;

    let userAbout = await User.findOne({ username: userId });

    if(req.session.user == userAbout.email) {
        res.render('follows', { title: `Seguidores - ${userAbout.username}`, userAbout })
    } else {
        res.render('404', { title: '404' });
    }
})

app.get('/:user/edit', async (req, res) => {
    if(!req.session.user) return res.redirect('/');

    let userId = req.params.user;
    
    let userAbout = await User.findOne({ username: userId });

    // console.log(userId);
    // console.log(userAbout);

    if(req.session.user == userAbout.email) {
        res.render('edit', { title: `Edit - ${userAbout.username}`, userAbout, id: userAbout.id });
    } else {
        res.render('404', { title: '404' });
    }


})


// app.get('*', (req, res) => {
//     if(req.session.user) return res.redirect('/home');
//     res.render('404', { title: '404' });
// });

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
})