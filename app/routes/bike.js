
var Bike = require('../models/bike');

module.exports = function(router) {
    router.route('/bikes')
        
        .get(function(req, res) {
            Bike.find({user: req.decoded._doc._id}, function(err, bikes) {
                if (err)
                    res.send(err);
                    
                res.status(200).json(bikes);
            });
        })
        
        .post(function(req, res) {
            var bike = new Bike();
            bike.name = req.body.name;
            bike.year = req.body.year;
            bike.size = req.body.size;
            bike.user = req.decoded._doc._id;
            bike.build = req.body.build;
            bike.maintenance = req.body.maintenance;
            bike.wanted = req.body.wanted;
            bike.save(function(err) {
                if (err)
                    res.send(err);
                    
                res.json(bike);
            });
        })
        
        // Admin Route to delete all Bikes... need to remove eventually.
        .delete(function(req, res) {
            Bike.remove(function(err) {
                if (err)
                    res.send(err);
                    
                res.json({message: "bikes deleted"});
            });  
        })
    ;
    
    router.route("/bikes/:id")
    
        .get(function(req, res) {
            Bike.findById(req.params.id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                res.status(200).json(bike);
            });
        })
        
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
        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);

                res.json(bike.build);
            });
        })

        .post(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.build.push({description: req.body.description, url: req.body.url});
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.json(bike);    
                });
                
            });
        })
        
    ;
    
    router.route("/bikes/:bike_id/build/:id")

        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                
                var build = bike.build.id(req.params.id);

                res.status(200).json(build);
            });
        })

        .put(function(req, res) {
            
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                var sub = bike.build.id(req.params.id);
                
                sub.description = req.body.description;
                sub.url = req.body.url;
                
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })
                
            })
        })
 
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
        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);

                res.json(bike.wanted);
            });
        })

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

        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                
                var wanted = bike.wanted.id(req.params.id);

                res.status(200).json(wanted);
            });
        })

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

    router.route("/bikes/:bike_id/wanted/:id/got")
        // Moves a part from wanted to build, which means someone bought the part.
        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                var sub = bike.wanted.id(req.params.id);
                
                // Add wanted item to build.
                bike.build.push({description: sub.description, url: sub.url});

                // Remove item from wanted list.
                bike.wanted.id(req.params.id).remove();

                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })    
            })
        })
    ;
    
    router.route("/bikes/:bike_id/maintenance")
        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);

                res.json(bike.maintenance);
            });
        })
        
        .post(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                bike.maintenance.push({ description: req.body.description, completeddate: req.body.completeddate });
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.json(bike);    
                });
                
            });
        })
        
    ;
    
    router.route("/bikes/:bike_id/maintenance/:id")

        .get(function(req, res) {
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                
                var maintenance = bike.maintenance.id(req.params.id);

                res.status(200).json(maintenance);
            });
        })

        .put(function(req, res) {
            
            Bike.findById(req.params.bike_id, function(err, bike) {
                if (err)
                    res.send(err);
                    
                var sub = bike.maintenance.id(req.params.id);
                
                sub.description = req.body.description;
                sub.completeddate = req.body.completeddate;
                
                bike.save(function(err) {
                    if (err)
                        res.send(err);
                        
                    res.status(200).json(bike);
                })
                
            })
        })
        
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