const httpStatus = require("http-status");
const { insert, list, listIdRoom, remove } = require("../services/Rooms");
const { passwordToHash } = require("../scripts/utils/helper");
const Rooms = require("../models/Rooms");
const Participant = require('../models/Participants');


const create = (req, res) => {
    const { eventName, eventDescription, lessonName } = req.body;

    if (!eventName || !eventDescription || !lessonName) {
        return res.status(httpStatus.BAD_REQUEST).send({ error: "Activity name, description and lesson name are required." });
    }

    const room = {
        eventName,
        eventDescription,
        lessonName,
        createdBy: req.user._doc._id 
    };

    insert(room)
        .then((response) => {
            res.status(httpStatus.CREATED).send(response);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
}

const index = (req, res) => {
    list()
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

const getByIdRoom = (req, res) => {
    if (req.params.id) {
        listIdRoom(req.params.id)
            .then((response) => {
                res.status(httpStatus.OK).send(response);
            })
            .catch((e) => res.status(httpStatus.NOT_FOUND).send({ error: "Aradığınız Oda Bulunamadı." }))
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Oda Getirilirken Hata Oluştu." });
    }
}

const deleteRoom = (req, res) => {
    remove(req.params.id)
        .then((deletedItem) => {
            if (!deletedItem) {
                return res.status(httpStatus.NOT_FOUND).send({ message: "Böyle bir oda bulunmamaktadır.", });
            }
            res.status(httpStatus.OK).send({
                message: "Oda silinmiştir.",
            });
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Silme işlemi sırasında hata ile karşılaşıldı." }));
}

const JoinRoom = async (req, res) => {

    const code = req.params.code;

    const room = await Rooms.findOne({ code });

    if (!room) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Geçersiz kod' });
    }
    const participant = new Participant({ room: room.id });
    await participant.save();

    let participants = room.participants || [];
    participants.push(participant.name);
    room.participants = participants;

    await room.save();

    return res.status(httpStatus.OK).json({ message: 'Katılım başarılı.', participant });
};

const getUserRooms = (req, res) => {
    const { id } = req.params;
  
    Rooms.find({ createdBy: id })
      .then((rooms) => {
        res.status(httpStatus.OK).json(rooms);
      })
      .catch((err) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
      });
  }

module.exports = {
    create,
    index,
    getByIdRoom,
    deleteRoom,
    JoinRoom,
    getUserRooms,
}