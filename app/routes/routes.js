var User = require('../models/user');
var jwt = require("jsonwebtoken");

module.exports = function(router) {
    
    router.route('/authenticate')
        .post(function(req, res) { 
            User.findOne({
               email: req.body.email 
            }, {'password':1, 'name': 1, 'email': 1}, function(err, user) {
                if (err)
                    res.send(err);
                    
                if (!user) {
                    res.status(400).json({message: 'user not found'});
                } else if (user) {
                    if (user.password != req.body.password) {
                        res.status(400).json({message: 'password incorrect'});
                    } else {
                        var token = jwt.sign(user, process.env.SECRET, {
                            expiresIn: 1440
                        });
                        
                        var cleanUser = user.toObject();
                        delete cleanUser['password'];
                        res.status(200).json({message: 'Authentication successful', token: token, user: cleanUser});
                    }
                }
            });
        });
    
    router.route('/users')
        .post(function(req, res) {
            // Check this link when I can to salt and hash the password. http://stackoverflow.com/questions/31906820/how-to-remove-password-from-mongoose-object
            var user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;
            
            user.save(function(err) {
                if (err)
                    res.send(err);
                
                // Change use to an object, so I can remove the password, so it isn't sent back with the JSON object.
                var newUser = user.toObject();
                delete newUser["password"];
                
                res.json(newUser);
            });
        });
    
    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        
        // will need to ensure proper authentication as well as routing to the correct users bike information.
        // Not worried about this just yet though.
        
        // Should also look at authorization: Bearer [ TOKEN HERE ]
        // http://angular-tips.com/blog/2014/05/json-web-tokens-examples/

        // Should maybe do something like this... 
        // if (req.param('token')) {
        //    token = req.param('token');
        //    // We delete the token from param to not mess with blueprints
        //    delete req.query.token;

        var token = req.params.token || req.headers.authorization;
        if (token) {
              
                jwt.verify(token, process.env.SECRET, function(err, decoded) {
                    if (err)
                        return res.status(403).json({message: 'Failed to authenticate token'});
                    
                    req.decoded = decoded;
                    next(); // make sure we go to the next routes and don't stop here
                });
        } else {
            return res.status(403).send({
                message: 'No token provided'
            });
        };
    });
    
    // Put all the links to the routes in here. 
    // Need to switch to doing with https://github.com/aseemk/requireDir, it will require a dir and loop through everything.
    // http://www.codekitchen.ca/guide-to-structuring-and-building-a-restful-api-using-express-4/
    require("./user")(router);
    require("./bike")(router);
    
}