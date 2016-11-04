
var Bike = require('../models/bike');

module.exports = function(router) {
    router.route('/bikes')
        
        // Get all bikes
        .get(function(req, res) {
            Bike.find(function(err, bikes) {
                if (err)
                    res.send(err);
                    
                res.status(200).json(bikes);
            });
        })
        
        // Add new bike
        .post(function(req, res) {
            var bike = new Bike();
            bike.name = req.body.name;
            bike.year = req.body.year;
            bike.size = req.body.size;
            bike.user = req.body.user;
            bike.build = req.body.build;
            bike.save(function(err) {
                if (err)
                    res.send(err);
                    
                res.json(bike);
            });
        })
        
        // Delete all bikes - used for development to clean up data.
        .delete(function(req, res) {
            Bike.remove(function(err) {
                if (err)
                    res.send(err);
                    
                res.json({message: "bikes deleted"});
            });  
        })
    ;
    
    router.route("/bikes/:id")
    
        // get bike
        .get(function(req, res) {
            Bike.findById(req.params.id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                res.status(200).json(bike);
            });
        })
        
        // update bike
        .put(function(req, res) {
            Bike.findById(req.params.id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.name = req.body.name;
                bike.year = req.body.year;
                bike.size = req.body.size;

                bike.save(function(err) {
                    if (err)
                        res.send(err);
                    
                    res.status(200).json(bike);
                });
                
            });
        })
        
        // delete the bike
        .delete(function(req, res) {
            Bike.remove({
                _id: req.params.id
            }, function(err, bike) {
                if (err)
                    res.send(err);
                
                res.status(200).json(bike);
            });
        })
    ;
    
    router.route("/bikes/:bike_id/build")
        
        // Add new part
        .post(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.build.push({description: req.body.description});
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.json(bike);    
                });
                
            });
        })
        
    ;
    
    router.route("/bikes/:bike_id/build/:id")
        // Update Part
        .put(function(req, res) {
            
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.build.id(req.params.id).description = req.body.description;
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })
                
            })
        })
        
        // Delete Part
        .delete(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                bike.build.id(req.params.id).remove();
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                });
            });
        })
    ;
    
    router.route("/bikes/:bike_id/wanted")
        
        // Add wanted item
        .post(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.wanted.push({ description: req.body.description, url: req.body.url });
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.json(bike);    
                });
                
            });
        })
        
    ;
    
    router.route("/bikes/:bike_id/wanted/:id")
        // Update wanted item
        .put(function(req, res) {
            
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                var sub = bike.wanted.id(req.params.id);
                
                sub.description = req.body.description;
                sub.url = req.body.url;
                
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })
                
            })
        })
        
        // Delete wanted item
        .delete(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                bike.wanted.id(req.params.id).remove();
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                });
            });
        })
    ;
    
    router.route("/bikes/:bike_id/maintenance")
        
        // Add wanted item
        .post(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.maintenance.push({ description: req.body.description });
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.json(bike);    
                });
                
            });
        })
        
    ;
    
    router.route("/bikes/:bike_id/maintenance/:id")
        // Update wanted item
        .put(function(req, res) {
            
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                var sub = bike.maintenance.id(req.params.id);
                
                sub.description = req.body.description;
                
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })
                
            })
        })
        
        // Delete wanted item
        .delete(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                bike.maintenance.id(req.params.id).remove();
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                });
            });
        })
    ;
}