
var Bike = require('../models/bike');
var Maintenance = require('../models/bike-maintenance');

// Need to set defaults for Populate (this is only for maintenance)
var popOptions = {path: 'maintenance', match: {completeddate: null}};


module.exports = function(router) {
    router.route('/bikes')
        
        .get(function(req, res) {
            Bike.find({user: req.decoded._doc._id})
            .populate(popOptions)
            .exec(function(err, bikes) {
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
            // bike.maintenance = req.body.maintenance;
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
                
                Maintenance.remove(function(err) {
                    if (err)
                        res.send(err);

                    User.remove(function(err) {
                        if (err)
                            res.send(err);
                    })
                })

                res.json({message: "bikes deleted"});
            });  
        })
    ;
    
    router.route("/bikes/:id")
    
        .get(function(req, res) {
            Bike.findOne({_id: req.params.id})
            .populate(popOptions)
            .exec(function(err, bike) {
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
            /*
                Returns all the maintenance items for a given bike (bike_id)
                Returns 20 maintenance item records, completed or not
                
                @Param   type    description 
                bike_id  url     bike id to return specified items for
                top      query   the maximum number of records to return
                start    query   return records starting at this date
                end      query   return records before this date.
                
                If completed date is null, that means the item is not completed. If you specify start or end, it will not return any items where completedate is null.
            */
            
            var query = { 
                bike: req.params.bike_id
            };
            
            // @top
            var recordLimit = 20;
            if (req.query.top) {
                recordLimit = parseInt(req.query.top);
            }
            
            // Check if start or end passed in as query string
            if (req.query.start || req.query.end) {
                query.completeddate = {};
                
                // @start
                if (req.query.start) {
                    query.completeddate['$gte'] = new Date(req.query.start);
                }
                
                // @end=
                if (req.query.end) {
                    query.completeddate['$lte'] = new Date(req.query.end);
                }
            }
            
            // PAGING
            // var page = 0;
            // if (req.query.page) {
            //     page = Math.max(0, req.param('page'));
            // }
            
            // specify fields to return
            Maintenance.find(query)
                // .populate()
                .limit(recordLimit)
                // .skip(recordLimit * page)  // PAGING
                .sort({completeddate: 1, description: 1})
                .exec(function(err, maintenance) {
                    if (err)
                        res.send(err);
                        
                    // res.json({maintenance, totalCount: });
                    res.json(maintenance);
                })
        })
        
        .post(function(req, res) {
            Bike.findById(req.params.bike_id)
                .populate('maintenance')
                .exec(function(err, bike) {
                    if (err)
                        res.send(err);
                    
                    var maintenanceItem = new Maintenance({
                        description: req.body.description, completeddate: req.body.completeddate, bike: req.params.bike_id
                    });

                    maintenanceItem.save(function(err) {
                        if (err)
                            res.send(err);

                        bike.maintenance.push(maintenanceItem);
                        bike.save(function(err) {
                            if (err)
                                res.send(err);
                                
                            Bike.populate(bike, 'maintenance', function(err, bike) {
                                res.json(bike);    
                            })
                                
                        });
                        
                    });
                    //bike.maintenance.push({  });
                    
                    
                });
        })
        
    ;
    
}