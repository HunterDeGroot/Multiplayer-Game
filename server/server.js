var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var path = require('path');

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cors());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, '../public/javascripts')));
app.use(express.static(path.join(__dirname, '../public/controllers')));
app.use(express.static(path.join(__dirname, '../public/bower_components')));
console.log(__dirname)

var mongoose = require("mongoose");
mongoose.connect('mongodb://104.236.118.111/db');

var Player = mongoose.model('Player', {playerId: Number,x: Number,y: Number,rot: Number});

app.get("/kill", function (req, res) {
    Player.remove({});
    Player.find(function (err, players) {
        res.send(players);
    });
});

app.get("/game", function (req, res) {
    Player.find(function (err, players) {
        res.sendFile(path.resolve(path.join(__dirname, '../public/index.html')));
    });
});

app.get("/", function (req, res) {
    Player.find(function (err, players) {
        res.send(players);
    });
});

app.post("/update", function (req, res) {
    var x = req.body.x;
    var y = req.body.y;
    var rot = req.body.rot;
    var playerId = req.body.playerId;

    Player.findOneAndUpdate({playerId: playerId}, {$set:{ x: x, y: y, rot:rot}}, {upsert:true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        return res.send("succesfully saved");
    });
});

app.listen(3000);