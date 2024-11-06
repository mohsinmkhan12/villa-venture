const User = require("../models/user.js");

module.exports.getSignup = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.postSignup = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", `Welcome to website, ${username}!`);
            res.redirect("/listings");
        })
        
        
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
    
}

module.exports.getLogin = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.postLogin = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    
}