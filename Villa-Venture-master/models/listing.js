const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { reviewSchema } = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    // required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    { type: Schema.Types.ObjectId,
      ref: "Review" 
    }
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },
  amenities: [{ type: String }] // Array of amenities as strings
});


listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing)
  {
    await reviewSchema.deleteMany({ _id: { $in: listing.reviews } });
  }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;