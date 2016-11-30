var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    password: {type: String, select: false},
    employeeId: Integer,
    about: String,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", UserSchema);