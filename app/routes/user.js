
var User = require('../models/user');

module.exports = function(router) {
    router.route('/users')
        .get(function(req, res) {
            User.find(function(err, users) {
                if (err)
                    res.send(err);
                    
                res.status(200).json(users);
            });
        })
        
        .post(function(req, res) {
            var user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.save(function(err) {
                if (err)
                    res.send(err);
                    
                res.json(user);
            });
        })
        
        .delete(function(req, res) {
            User.remove(function(err) {
                if (err)
                    res.send(err);
                    
                res.json({message: "users deleted"});
            });  
        })
    ;
}