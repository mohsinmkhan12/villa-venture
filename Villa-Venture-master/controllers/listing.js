const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const MAP_TOKEN = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: MAP_TOKEN });

const animaties_arrray = [
    'pools',
    'villa',
    'apartment',
    'mountain',
    'climbing',
    'farms',
];

module.exports.index = async (req, res) => {
    

    try {
        // Construct filter options based on query parameters
        const filterOptions = {};
        const searchQuery = req.query.search || ''; // Get the search query
        const currentAmenity = req.query.amenity || ''; // Get the selected amenity filter

        if (searchQuery) {
            // Construct a regular expression for case-insensitive search
            const searchRegex = new RegExp(searchQuery, 'i');
            filterOptions.$or = [
                { location: searchRegex },
                { country: searchRegex },
                { title: searchRegex }
            ];
        }

        if (currentAmenity) {
            // Add amenity filter
            filterOptions.amenities = currentAmenity;
        }

        // Find listings based on filter options
        const allListings = await Listing.find(filterOptions).populate("reviews");
        allListings.forEach(listing => {
            if (listing.reviews.length > 0) {
                // Calculate average rating
                const noOfRatings = listing.reviews.length;
                const totalRating = listing.reviews.reduce((acc, review) => acc + review.rating, 0);
                const averageRating = totalRating / noOfRatings;
                listing.averageRating = `☆ ${averageRating.toFixed(1)} (${noOfRatings} reviews)`; // Add averageRating to each listing
            } else {
                listing.averageRating = "";
            }
        });

        // Check if there are no listings returned
        if (allListings.length === 0) {
            req.flash("error", "No listings found matching your criteria."); // Flash an informational message
            res.redirect('/listings'); // Redirect back to listings page
        } else {
            res.render("listings/index.ejs", { allListings, animaties_arrray, currentAmenity });
        }
    } catch (err) {
        console.error("Error fetching listings:", err);
        req.flash("error", "Error fetching listings");
        res.status(500).redirect('/listings'); // Redirect with an error message
    }
}





module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        },
    })
    .populate("owner");
    
    if(!listing){
      req.flash("error","Listing does not exist!");
      return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async(req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  // Forward geocoding to get location coordinates
  let response = await geocodingClient.forwardGeocode({
      query: `${req.body.listing.location} ${req.body.listing.country}`,
      limit: 1
  }).send();

  // Ensure amenities are always treated as an array
  let amenities = Array.isArray(req.body.listing.amenities) ? req.body.listing.amenities : [req.body.listing.amenities];

  // Correctly constructing the new listing object
  const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id, // Set the owner to the current user's ID
      image: { url, filename }, // Set the image info
      geometry: response.body.features[0].geometry, // Set the geometry from the geocoding response
      amenities: amenities // Ensure amenities are set correctly
  });

  try {
      // Save the new listing to the database
      let savedListing = await newListing.save();
      console.log(savedListing);
      
      // Set a flash message for successful creation and redirect to the listings page
      req.flash("success", "Successfully made a new listing!");
      res.redirect('/listings');
  } catch (error) {
      console.error("Error saving listing:", error);
      req.flash("error", "Failed to create listing");
      res.redirect('/listings/new'); // redirect back to form page on error
  }
}



module.exports.editListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing does not exist!");
      return res.redirect("/listings");
    }

    let oregImg = listing.image.url;
    oregImg = oregImg.replace('/upload','/upload/w_250,c_scale');
    res.render("listings/edit.ejs",{listing, oregImg});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error","You don't have permission to edit!");
        return res.redirect(`/listings/${id}`);
    }

    // Ensure amenities is always an array
    if (req.body.listing.amenities) {
        if (!Array.isArray(req.body.listing.amenities)) {
            req.body.listing.amenities = [req.body.listing.amenities];
        }
    } else {
        req.body.listing.amenities = []; // Default to empty array if no amenities provided
    }

    let updatedListing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    
    req.flash("success","Successfully updated listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
  try {
      let { id } = req.params;
      let listing = await Listing.findByIdAndDelete(id);
      if (!listing) {
          req.flash("error", "Listing not found!");
          return res.redirect(`/listings`);
      }
      console.log(listing);
      req.flash("success", "Successfully deleted listing!");
      res.redirect(`/listings`);
  } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong!");
      res.redirect(`/listings`);
  }
}
