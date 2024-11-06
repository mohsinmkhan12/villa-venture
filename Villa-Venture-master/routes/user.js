const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const {getSignup, postSignup,getLogin,postLogin} = require("../controllers/user.js");

router.route("/signup")
    .get(getSignup )
    .post( 
        wrapAsync(postSignup))

router.route("/login")
    .get(getLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', 
            { 
                failureFlash: true,
                failureRedirect: '/login'
            }) ,
        (postLogin))

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err){
            next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
});

module.exports = router