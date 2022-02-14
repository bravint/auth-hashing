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
}

router.post('/register', async (req, res) => {
    let {username, password} = req.body

    password = await generateHashedPassword(password)

    const user = {username, password}

    const createdUser = await prisma.user.create({
        data: user
    })

    res.json(createdUser)
});

router.post('/login', async (req, res) => {
    let {username, password} = req.body

    const findUserbyUsermame = await prisma.user.findUnique({
        where: {
            username
        }
    })

    if (!findUserbyUsermame) res.status(404).send(`no user found with username ${username}`)

    if (bcrypt.compare(password, findUserbyUsermame.password)) {
        return res.json(jwt.sign(username, secret))
    }

    res.status(401).send('incorrect credentials provided')
});

module.exports = router;
