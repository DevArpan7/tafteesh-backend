const express = require("express");
const app = express();

var cors = require('cors');
app.use(cors());

app.use(express.json());

//for accessing the static file url
app.use(express.static('uploads'));

const fs = require('fs');

const port = process.env.PORT || 5000;

require("./db/connection");

const routes = require("./routing");

// to get error logs
app.get("/error-log", async (req, res) => {
    fs.readFile(__dirname+'/errors.log', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.send(err);
        }
        res.send(data);
        console.log(data);
    });
})

// to get info logs
app.get("/info-log", async (req, res) => {
    fs.readFile(__dirname+'/info.log', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.send(err);
        }
        res.send(data);
        console.log(data);
    });
})

app.use("/api", routes);

app.get("/", async (req, res) => {
    // var ip = req.headers['x-forwarded-for'] ||
    //  req.socket.remoteAddress ||
    //  null;
    res.send("Your app is running perfectly...");
})

app.listen(port, ()=>{
    console.log(`Your app listening at port ${port}`);
})