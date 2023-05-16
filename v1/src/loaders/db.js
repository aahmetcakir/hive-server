const Mongoose = require("mongoose");

const db = Mongoose.connection;

db.once("open", () => {
  console.log("DB bağlandı");
});

              //  const connectDB = async () => {
              //    await Mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
              //      {
              //        useNewUrlParser: true,
              //       useUnifiedTopology: true
              //      });
              //   };

                const connectDB = async () => {
               await Mongoose.connect(
                  process.env.DATABASE_URL, 
// // // // // // // // // // // // // // //       process.env.ENV === "dev"
// // // // // // // // // // // // // // //      //   ? `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
// // // // // // // // // // // // // // //      //   : process.env.DB_LINK,
                 {
                  useNewUrlParser: true,
                    useUnifiedTopology: true,
                   }
                 );
               };

module.exports = {
  connectDB,
};