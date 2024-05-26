// models/Clipboard.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const clipboardSchema = new Schema({
    content: String,
    url: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '5d' } // Add TTL index
}, { timestamps: true });

//experires 5seconds


const Clipboard = mongoose.model('Clipboard', clipboardSchema);
module.exports = Clipboard;
