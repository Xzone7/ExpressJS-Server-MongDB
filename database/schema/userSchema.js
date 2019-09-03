const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstname: String,
    lastname: String,
    sex: String,
    age: String,
    password: String
});

module.exports = mongoose.model("Users", UserSchema);