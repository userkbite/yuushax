const express = require('express');
const router = express.Router();

const User = require('./user');

//Register user
router.post('/register', (req, res) => {
    const {email, password} = req.body;
    
    const user = new User({email, password});
    
    if(password.length < 6) {
        res.send('Password Must be More Than 6 Characters');
    } else {
        user.save(async err => {
            if (err) {
                res.send('Error Registering User');
                console.log(err);
            } else {
                req.session.user = email;
                res.status(200).redirect('/home')
            }
        });
    }

});

//Login user
router.post('/login', (req, res) => {
    if(req.session.user) return res.redirect('/home');
    const {email, password} = req.body;

    User.findOne({email}, (err, user) => {
        if (err) {
            res.send('Error Authenticating User');
        } else if (!user) {
            res.send('User does not exist');
        } else {
            user.isCorrectPassword(password, async (err, result) => {
                if (err) {
                    res.send('Error Authenticating');
                } else if (result) {
                    req.session.user = email;
                    res.redirect('/home');
                } else {
                    res.send('Invalid email or password');
                }
            });
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send('Error');
        } else {
            res.redirect('/');
        }
    })
})


module.exports = router;