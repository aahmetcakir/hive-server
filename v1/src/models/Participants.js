   const Mongoose = require("mongoose")

   const ParticipantSchema = new Mongoose.Schema({
       name: {
           type: String,
           default: () => "anonymous-" + Math.random().toString(36).substring(7),
         },
         room: {
           type: Mongoose.Schema.Types.ObjectId,
           ref: "Rooms"
         },
         ip: {
          type: String,
          required: true
        },
       }, { timestamps: true, versionKey: false });

   module.exports = Mongoose.model("participant", ParticipantSchema);

