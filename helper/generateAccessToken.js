require('dotenv').config();
var express = require('express');
const app = express();
const jwt = require("jsonwebtoken");

const generateAccessToken = (req, res) => {
    // console.log(req);
    const accessToken = jwt.sign(req, process.env.ACCESS_TOKEN_KEY);
    // const accessToken = jwt.sign(req, process.env.ACCESS_TOKEN_KEY, {expiresIn: '20s'});
    return accessToken;
}

module.exports = generateAccessToken;