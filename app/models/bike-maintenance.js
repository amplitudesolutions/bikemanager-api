var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// var Bike = require('../models/bike');

var MaintenanceSchema = new Schema({
    description: String,
    completeddate: Date,
    bike: { type: Schema.Types.ObjectId, ref: "Bike", required: true }
});

MaintenanceSchema.pre("remove", function(next) {
	this.model("Bike").update(
		{maintenance: this._id},
		{$pull: {maintenance: this._id}},
		{multi:true},
		next
	);
	next();
});

module.exports = mongoose.model("Maintenance", MaintenanceSchema);