const Mongoose = require("mongoose")
const logger = require("../scripts/logger/Hosts");

const HostSchema = new Mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    password : String,
}, {timestamps: true, versionKey : false});


//HostSchema.pre("save", (next) => {
  //  next();
 //})
 
 HostSchema.post("save", (doc) => {
     logger.log({
        level : "info",
        message : doc 
     })
  })

module.exports = Mongoose.model("host", HostSchema);

