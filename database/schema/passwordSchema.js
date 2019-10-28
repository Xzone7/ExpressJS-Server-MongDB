const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PasswordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String
});

module.exports = mongoose.model("Passwords", PasswordSchema);