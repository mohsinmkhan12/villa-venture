const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userScheme = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
});

userScheme.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userScheme);