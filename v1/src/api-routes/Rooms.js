const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { create, index, getByIdRoom, deleteRoom, JoinRoom, getUserRooms} = require("../controllers/Rooms");

const router = express.Router();

//APİ
router.route("/").get(index);
router.route("/:id").get(getByIdRoom);
router.route("/").post(authenticate,create);//validate(schemas.createValidation), create);
router.route("/:id").delete(deleteRoom);
router.route("/:code/").post(JoinRoom);
router.route("/user/:id").get(getUserRooms);


module.exports = router;