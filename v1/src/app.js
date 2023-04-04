const express = require("express");
const helmet = require("helmet")
const config = require("./config");
const loaders = require("./loaders");
const events = require("./scripts/events");
const { HostRoutes } = require("./api-routes");
const cors = require("cors")

config();
loaders();
events();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());


app.get("/deployment", (req, res) => {
    res.send("Hello deployment!");
})

app.listen(process.env.APP_PORT || 3000, () => {
    console.log("Sunucu ayağa kalktı.");
    app.use("/hosts", HostRoutes);
});