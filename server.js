var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

mongoose.Promise = Promise

var dbUrl = 'mongodb://user:user@ds033186.mlab.com:33186/learning-node'

var Message = mongoose.model('Message',{
    name: String,
    message: String
})

// var messages = [
//     {name: 'Tim', message: 'Hello'},
//     {name: 'David', message: 'Hi'}
// ]

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    //console.log(req.body);
    var message = new Message(req.body)
    message.save()
    .then(() => {
        console.log('saved')
        return Message.findOne({message: 'badword'})
    })
    .then( censored => {
        if (censored) {
            console.log('censored word found', censored)
            return Message.remove({_id: censored.id})
        }
        io.emit('message', req.body) // submit an event from server to all client
        res.sendStatus(200)
    })
    .catch((err) => {
        res.sendStatus(500)
        return console.error(err)
    })
})

io.on('connection', (socket) => { // connection event, function takes in socket
    console.log('a user is connected')
})

mongoose.connect(dbUrl, {useMongoClient: true}, (err) => {
    console.log('connected to mLAB', err)
})

var server = http.listen(3000, () => {
    console.log('sever is listening on port', server.address().port)
})
