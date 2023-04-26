const Room = require("../models/Rooms");

const insert = (data) => {
    const room = new Room(data);
    return room.save();
}

const list = () => {
    return Room.find({});
}

const listIdRoom = (id) => {
    return Room.findById(id);
}

const remove = (id) => {
    return Room.findByIdAndDelete(id);
}


module.exports = {
    insert,
    list,
    remove,
    listIdRoom,
}