var Bike = require('../models/bike');
var Maintenance = require('../models/bike-maintenance');

module.exports = function(router) {   
    router.route("/maintenance/:id")

        .get(function(req, res) {

            Maintenance.findById(req.params.id, function(err, maintenance) {
                if (err)
                    res.send(err);

                res.status(200).json(maintenance);
            });

        })

        .put(function(req, res) {
        	Maintenance.findById(req.params.id, function(err, maintenance) {
            	if (err)
            		res.send(err);

            	maintenance.description = req.body.description;
            	maintenance.completeddate = req.body.completeddate;

            	maintenance.save(function(err) {
            		if (err)
            			res.send(err);

            		res.status(200).json(maintenance);
            	});
            });
        })
        
        .delete(function(req, res) {

       		Maintenance.findById(req.params.id, function(err, maintenance) {
       			if (err)
       				res.send(err);

       			maintenance.remove(function(err) {
       				if (err)
       					res.send(err);

					res.status(200).json('message: Maintenance item removed.');
       			});
       		});
       		
        })
    ;

}