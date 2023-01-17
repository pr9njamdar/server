const express = require('express');
const app = express();
const http = require('http');

const axios = require("axios")



const { Server } = require("socket.io");
const cors = require("cors")
app.use(cors())
const mongoose = require('mongoose');
const server = http.createServer(http)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = process.env.port||3001
const port1 = process.env.port||3002
// Socket connection code
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("send-message", (message) => {
        socket.broadcast.emit('recieve-message', message)
    });

    socket.on('user-joined', (username) => {
        socket.broadcast.emit('user-sucessfully-joined', username);
    });
    
})



// Mongo db code
mongoose.connect('mongodb+srv://Pr9:pr9j1610@cluster0.inutoi5.mongodb.net/?retryWrites=true&w=majority');
const Member = mongoose.model('Member', {
    email: String,
    name: String,
    password: String
});

const Rooms = mongoose.model('Rooms', {

    name: String,
    members: [{
        membername: String,
        team: String,
    }]



})
//   new Rooms({
//     name:'Room2',
//      members:{


//   }}).save().then(()=>{console.log('new room created')})
// server end points

app.post('/register', (req, res) => {
    const member = new Member({ name: req.body.name, password: req.body.password, email: req.body.email });
    member.save().then(() => console.log('User saved succesfully'));

})


app.post('/login', (req, res) => {

    Member.findOne({ email: req.body.email, password: req.body.password }, (error, user) => {
        if (error) {
            console.log('error');
            res.send({
                memberfound: false,
            })
        }
        else {

            Rooms.findOne({ name: req.body.room }, (error, room) => {
                if (error) {
                    res.send('no room found')
                }
                else {
                    console.log('room found')
                    res.send({ room, memberfound: true, name: user.name })
                    // Rooms.findOneAndUpdate({ name: req.body.room }, { $push: { members: { membername: user.name, team: 'MI' } } }, () => {
                    //     console.log('room found')
                    //     res.send({ room, memberfound: true, name: user.name })
                    // })





                }
            })

        }

    })



})

 app.get('/teammembers', (req, res) => {
     Rooms.findOne({ name: 'Room2' }, (err, room) => {
         if (err) {
             console.log('nothing found')
             res.send('nothing')
         }
         else {
             console.log(room)
             res.send(room)
         }
     })
 })

 app.post('/removeuser', (req, res) => {
     Rooms.findOne({ name: 'Room2' }, (error, room) => {
         if (error) {
             console.log('nothing found')
             res.send('nothing')
         }
         else {
             Rooms.findOneAndUpdate({ name: 'Room2' }, { $pull: { members: { membername: req.body.name, team: 'MI' } } }, (error) => {
                 if (error) {
                     res.send('error')
                 }
                else {
                     console.log('member removed successfuly')
                     res.send('logged out succesfully')
                 }
             })
         }
     })

 })

 app.post('/addmember',(req,res)=>{

    Rooms.findOne({ name: req.body.room }, (error, room) => {
        if (error) {
            res.send('no room found')
        }
        else {
            
            
             Rooms.findOneAndUpdate({ name: req.body.room }, { $push: { members: { membername: req.body.name, team: 'MI' } } }, () => {
                 
                 res.send('member re-registered')
             })





        }
    })
    
 })
 

 // Score api's
 var counter=0,keyindex=0;
 const apikeys=[
    '5f7f7a72-9813-4a14-8ec2-18f2fb509cae',
    '4fd4bad7-67b6-4daa-8b6c-676fb822b228',
    '592669d7-ec8e-4047-97d0-137f5d4f2e48',
    'bd256b6f-0f81-436d-a05b-a0378d57022e',
    '3cc79596-3781-4df7-b559-e95d05dea5ba',
    '1729d00d-b627-4351-895b-7f4ae2187b96',
    'a30ebd3f-b7f5-4958-ae85-a97a4336da21',
    'f80a746f-49a6-4ce3-9ce5-e551ca10ac39',
    '3ea46348-aff7-4c6e-86b0-dcaf36b382f0',
    'fc4494fe-aa4c-4497-bf63-71184f3acb65',
    '4a0335b5-01dd-40be-bf14-199b77bef9df',
    'cf017c51-87c7-41fa-9d1c-75920e87cb6d',
    '4fd64d6b-7d60-49be-ad28-df87e9d62d03',
    'd0efb230-b99e-4d80-aded-8504a79f3337',
    'fa2901ab-0997-43b7-9c08-41788d0c37b3',
    'f741463f-19d4-48d3-93cd-83efc116b68f',
    '8bcbaa09-1b47-439e-897f-dff3673ea7e0',
    '96c7ada2-c1d6-4023-bf04-0ef86598f523',
    'bf3c0bda-040c-42a0-9b37-9e412df7fd68',
    'd17464a5-8dc7-4288-975d-74b6eb7d985a'
    ]
    setInterval(()=>{
        if (counter<100 && keyindex<20){
            axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${apikeys[keyindex]}&offset=0`).then((response)=>{
                     console.log(response.data.data[0]);
                     console.log(apikeys[keyindex],counter,keyindex);
                     counter++;
                 })
           
            
            
        }
        if (keyindex==20)
        {
            
            keyindex=0
        }
        if(counter==100){
counter=0;
keyindex++;
        }
        
      },5000000)

server.listen(3002, () => {
    console.log('server is live',port1)
})
app.listen(port, () => {
    console.log('app is live',port)
})