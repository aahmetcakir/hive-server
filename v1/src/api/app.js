const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet")
const config = require("../config");
const loaders = require("../loaders");
const events = require("../scripts/events");
const { UserRoutes, RoomRoutes } = require("../api-routes");
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

app.use('/api', (req, res) => {
    res.send("Hello World!");
})


app.listen(process.env.APP_PORT || 8000, () => {
    console.log("Sunucu ayağa kalktı.");
    app.use("/api/users", UserRoutes);
    app.use("/api/rooms", RoomRoutes);
})
