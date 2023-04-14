 const Mongoose = require("mongoose");
 const shortid = require('shortid');

 const RoomSchema = new Mongoose.Schema({

    code: {
      type: String,
      default: shortid.generate,
    },

    eventName: {
      type: String,
      required: true,
    },

    eventDescription: {
      type: String,
      required: true,
    },

    lessonName: {
      type: String,
      required: true,
    },

    createdBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

     participants: [{
       type: String,
       ref: "Participant"
     }],
 }, { timestamps: true, versionKey: false });

 module.exports = Mongoose.model("room", RoomSchema);
