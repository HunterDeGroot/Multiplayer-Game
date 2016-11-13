var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cors());
app.use(bodyParser());

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/hddb');

var Product = mongoose.model('Product', {name: String});
var Player = mongoose.model('Player', {playerId: Number,x: Number,y: Number,rot: Number});

// var product = new Product({name: "WebStorm"});
// product.save((function (err) {
//     if(err) {
//         console.log('failed');
//     } else {
//         console.log('saved');
//     }
// }));

app.get("/", function (req, res) {
    Player.find(function (err, players) {
        res.send(players);
    });
});

app.post("/add", function (req, res) {
    var name = req.body.name;
    var product = new Product({name: name});
    product.save(function (err) {
        res.send();
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
    //
    // var player = new Player({playerId: playerId, x: x, y:y});
    // player.save(function (err) {
    //     res.send();
    // });
});

io.on('connection', function(socket) {
    //Globals
    // var defaultRoom = 'general';
    // var rooms = ["General", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];
    //
    //Emit the rooms array
    socket.on('poo', function (yup){
        console.log("yeet");
        poo: 'poop'
    });

    // //Listens for new user
    // socket.on('new player', function(data) {
    //     data.room = defaultRoom;
    //     //New user joins the default room
    //     socket.join(defaultRoom);
    //     //Tell all those in the room that a new user joined
    //     io.in(defaultRoom).emit('user joined', data);
    // });

    // //Listens for switch room
    // socket.on('switch room', function(data) {
    //     //Handles joining and leaving rooms
    //     //console.log(data);
    //     socket.leave(data.oldRoom);
    //     socket.join(data.newRoom);
    //     io.in(data.oldRoom).emit('user left', data);
    //     io.in(data.newRoom).emit('user joined', data);
    //
    // });
    //
    // //Listens for a new chat message
    // socket.on('new message', function(data) {
    //     //Create message
    //     var newMsg = new Chat({
    //         username: data.username,
    //         content: data.message,
    //         room: data.room.toLowerCase(),
    //         created: new Date()
    //     });
    //     //Save it to database
    //     newMsg.save(function(err, msg){
    //         //Send message to those connected in the room
    //         io.in(msg.room).emit('message created', msg);
    //     });
    // });
});

app.listen(3000);