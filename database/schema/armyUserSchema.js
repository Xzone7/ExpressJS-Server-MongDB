const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArmyUserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    avatar_img: Buffer,
    name: String,
    sex: String,
    start_date: String,
    phone: String,
    email: String,
    superior: {name: String, _id: mongoose.Schema.Types.ObjectId},
    num_of_ds: [{_id: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model("ArmyUsers", ArmyUserSchema);