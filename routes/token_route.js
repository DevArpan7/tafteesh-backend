require('dotenv').config();
var express = require('express');
var tokenRouter = express.Router();
const app = express();
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../helper/generateAccessToken");


tokenRouter.post('/create', (req, res) => {
    const refreshToken = req.body.token;
    // console.log(refreshTokens);
    if(refreshToken == null) return res.status(401).send();
    // if(!refreshTokens.includes(refreshToken)) return res.status(403).send();
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
        if(err) return res.status(403).send();
        const accessToken = generateAccessToken({data: user.data});
        res.json({"accessToken": accessToken});
    })
})


// tokenRouter.delete('/logout', function (req, res) {
//     refreshTokens = [];
//     console.log(refreshTokens);
//     res.status(200).send('User logged out')
// })


module.exports = tokenRouter;