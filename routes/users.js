const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =================================== GET routes for Users for login===============================//

router.get(`/login`, async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})

// =================================== GET routes for Users for Register===============================//

router.get(`/register`, async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})

// =================================== POST routes for users for Login===============================//

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send('password is wrong!');
    }
})

// =================================== POST routes for users for register===============================//

router.post('/register', async (req, res) => {
    try {
        req.checkBody("name", "name can not be blank").notEmpty();
        req.checkBody("email", "email can not be blank").notEmpty();
        req.checkBody("passwordHash", "passwordHash can not be blank").notEmpty();
        req.checkBody("phone", "phone can not be blank").notEmpty();
        req.checkBody("city", "city can not be blank").notEmpty();
        req.checkBody("country", "country can not be blank").notEmpty();

        const errors = req.validationErrors();
        if (errors) {
            let error = errors[0].msg;
            console.log("Field is missing", error);
        }
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            city: req.body.city,
            country: req.body.country,
        })
        user = await user.save();

        if (!user)
            return res.status(400).send('the user cannot be created!')

        res.send(user);
    } catch (error) {
        console.log("Error is=========>", error);
        return res.status(
            res,
            500,
            "Internal server error"
        );
    }
});

module.exports = router;

// ===================================END===============================//
