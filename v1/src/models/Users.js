const Mongoose = require("mongoose")
const logger = require("../scripts/logger/Users");

const UserSchema = new Mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    profile_image: String,
    rooms: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'room' }], 

}, { timestamps: true, versionKey: false });

UserSchema.post("save", (doc) => {
    logger.log({
        level: "info",
        message: doc,
    })
})

module.exports = Mongoose.model("user", UserSchema);
