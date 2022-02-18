const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

const secret = 'secret';

const generateHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
};

router.post('/register', async (req, res) => {
    let { username, password } = req.body;

    password = await generateHashedPassword(password);

    const user = { username, password };

    let createdUser = await prisma.user.create({
        data: user,
    });

    delete createdUser.password;

    console.log('Created User', createdUser)

    res.status(201).json(createdUser);
});

router.post('/login', async (req, res) => {
    let { username, password } = req.body;

    const findUserbyUsermame = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!findUserbyUsermame) res.status(401).json(`No user found with username ${username}`);

    if (await bcrypt.compare(password, findUserbyUsermame.password)) {
        return res.status(200).json(jwt.sign(username, secret));
    }

    res.status(401).json('Incorrect credentials provided');
});

module.exports = router;
