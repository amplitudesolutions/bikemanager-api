var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BikeSchema = new Schema({
    name: String,
    year: Number,
    size: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    build: [ { description: String } ],
    wanted: [ { description: String, url: String, qty: Number, price: Number } ],
    maintenance: [ { description: String, completeddate: Date } ]
});

module.exports = mongoose.model("Bike", BikeSchema);