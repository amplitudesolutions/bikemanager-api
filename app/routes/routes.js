module.exports = function(router) {
    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        
        // will need to ensure proper authentication as well as routing to the correct users bike information.
        // Not worried about this just yet though.
        
        next(); // make sure we go to the next routes and don't stop here
    });
    
    // Put all the links to the routes in here. 
    // Need to switch to doing with https://github.com/aseemk/requireDir, it will require a dir and loop through everything.
    // http://www.codekitchen.ca/guide-to-structuring-and-building-a-restful-api-using-express-4/
    require("./user")(router);
    require("./bike")(router);
    
}