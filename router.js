const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('./user');

//Register user
router.post('/register', (req, res) => {
    const {username, email, password} = req.body;
    
    const user = new User({username, email, password});
    
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

router.post('/edit', async (req, res) => {
    const {id, newUsername, newBio} = req.body;

    // console.log(id)
    // console.log(newUsername)

    let user = await User.find({_id: mongoose.Types.ObjectId(id) });

    console.log(user)
    
    user.forEach(async doc => {
        const updateResult = await User.updateOne(
            { _id: id, username: doc.username },
            { $set: { username: newUsername, bio: newBio}}
        );
    });
    res.redirect(`/${newUsername}`);
})


module.exports = router;