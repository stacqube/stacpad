// app.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const Clipboard = require('./models/clipboard');

const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb+srv://stacqube024:5Qu3rNB8wT3MxVN0@sqboard.1dym5b7.mongodb.net/?retryWrites=true&w=majority&appName=SQBOARD', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// MongoDB connection status
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', async (req, res) => {
    const content = req.body.content;
    const url = uuidv4();
    
    const newClipboard = new Clipboard({ content, url });
    await newClipboard.save();
    
    res.redirect(`/clip/${url}`);
});

app.get('/clip/:url', async (req, res) => {
    const url = req.params.url;
    const clipboard = await Clipboard.findOne({ url });
    
    if (clipboard) {
        res.render('clip', { clipboard });
    } else {
        res.status(404).send('Clipboard not found');
    }
});

// WebSocket connection
io.on('connection', (socket) => {
    socket.on('join_clipboard', (url) => {
        socket.join(url);
    });

    socket.on('update_clipboard', async (data) => {
        const { url, content } = data;
        const clipboard = await Clipboard.findOneAndUpdate({ url }, { content }, { new: true });
        if (clipboard) {
            io.to(url).emit('clipboard_updated', clipboard.content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});