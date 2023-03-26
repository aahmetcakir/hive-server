const express = require("express");
const helmet = require("helmet")
const config = require("./config");
const loaders = require("./loaders");
const events = require("./scripts/events");
const { HostRoutes } = require("./api-routes");

config();
loaders();
events();

const app = express();
app.use(express.json());
app.use(helmet());



app.listen(process.env.APP_PORT, () => {
    console.log("Sunucu ayağa kalktı.");
    app.use("/hosts", HostRoutes);
})
  