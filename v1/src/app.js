const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet")
const config = require("./config");
const loaders = require("./loaders");
const events = require("./scripts/events");
const { UserRoutes, RoomRoutes } = require("./api-routes");
const cors = require("cors")
const path = require("path");

config();
loaders();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "./", "uploads")));


<<<<<<< HEAD
app.get("/deployment", (req, res) => {
    res.send("Hello deployment!");
})
app.listen(process.env.APP_PORT || 3000, () => {
    console.log("Sunucu ayağa kalktı.");
    console.log("Sunucu portu: " + process.env.APP_PORT || 3000);
    app.use("/hosts", HostRoutes);
});
=======


app.listen(process.env.APP_PORT || 8000, () => {
    console.log("Sunucu ayağa kalktı.");
    app.use("/users", UserRoutes);
    app.use("/rooms", RoomRoutes);
})
>>>>>>> refs/remotes/origin/main
