const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { ReviewSchema}  = require("../schema.js");
const {isLoggedIn,isReviewAuthor} = require("../middleware.js");
const {postReview,deleteReview} = require("../controllers/review.js");

// Joi validation
// validate for review
const validateReview = (req,res,next)=>{
    let {error} = ReviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
}

// Reviews
// Post Route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(postReview));


// Delete review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(deleteReview));

module.exports = router;