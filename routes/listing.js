const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {ListingSchema, ReviewSchema}  = require("../schema.js");
const { isLoggedIn, isOwner,isReviewAuthor } = require("../middleware.js");
const {index,renderNewForm,showListing,createListing,editListing,updateListing,deleteListing} = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require('../cloudConfig.js')
const upload = multer({ storage })

// joi validation
// validate for listing
const validateListing = (req,res,next)=>{
    let {error} = ListingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
}

// Index Route
router.route("/")
.get(wrapAsync(index))
.post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(createListing)
);

// New Route
router.get("/new",isLoggedIn,renderNewForm);


router.route("/:id")
    .get(wrapAsync(showListing))
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(updateListing))


router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(deleteListing));


// Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(editListing));

module.exports = router;


