var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BikeSchema = new Schema({
    name: { type: String, required: true },
    year: Number,
    size: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    build: [ { description: String, url:String } ],
    wanted: [ { description: String, url: String } ],
    // maintenance: [ { description: String, completeddate: Date } ]
    maintenance: [ {type: Schema.Types.ObjectId, ref: 'Maintenance' } ]
});

module.exports = mongoose.model("Bike", BikeSchema);