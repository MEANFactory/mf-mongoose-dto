module.exports.doSeed = function (next) {

    require('./person.seed').doSeed(function(err){
        if (err) { return next(err); }
        next();


        // require('./profile.seed').doSeed(function(err){
        //     if (err) { return next(err); }
        //
        //     next();

            // require('./app.seed').doSeed(function(err){
            //     if (err) { return next(err); }
            //     require('./product.seed').doSeed(function(err){
            //         if (err) { return next(err); }
            //
            //         next();
            //     });
            // });
        // });
    });
};
