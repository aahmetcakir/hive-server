const httpStatus = require("http-status");
const Rooms = require("../models/Rooms");
const User = require("../models/Users");
const Participant = require('../models/Participants');
const { insert, list, listIdRoom, remove, } = require("../services/Rooms");

// const create = (req, res) => {
//     const { eventName, eventDescription, lessonName } = req.body;

//     if (!eventName || !eventDescription || !lessonName) {
//         return res.status(httpStatus.BAD_REQUEST).send({
//             error: "Aktivite adı, aktivite açıklaması ve ders adı girilmesi zorunludur.",
//         });
//     }

//     const newRoom = {
//         eventName,
//         eventDescription,
//         lessonName,
//         createdBy: req.user._doc._id,
//     };

//     insert(newRoom)
//         .then((response) => {
//             User.findByIdAndUpdate(
//                 req.user._doc._id,
//                 { $push: { rooms: response._doc._id } },
//                 { new: true, select: 'firstName lastName email createdAt updatedAt rooms' }
//             )
//                 .populate({
//                     path: 'rooms',
//                     model: Rooms,
//                     select: 'eventName eventDescription lessonName code'
//                 })
//                 .then((user) => {
//                     res.status(httpStatus.CREATED).send(user.rooms);
//                 })
//                 .catch((error) => {
//                     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                         error: "Oda oluşturma sırasında bir hata oluştu.",
//                     });
//                 });
//         })
//         .catch((error) => {
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 error: "Oda oluşturma sırasında bir hata oluştu.",
//             });
//         });
// };

// const create = (req, res) => {
//     const { eventName, eventDescription, lessonName } = req.body;

//     if (!eventName || !eventDescription || !lessonName) {
//         return res.status(httpStatus.BAD_REQUEST).send({
//             error: "Aktivite adı, aktivite açıklaması ve ders adı girilmesi zorunludur.",
//         });
//     }

//     const newRoom = {
//         eventName,
//         eventDescription,
//         lessonName,
//         createdBy: req.user._doc._id,
//     };

//     insert(newRoom)
//         .then((response) => {
//             User.findByIdAndUpdate(
//                 req.user._doc._id,
//                 { $push: { rooms: response._doc._id } },
//                 { new: true, select: 'firstName lastName email createdAt updatedAt rooms' }
//             )
//                 .populate({
//                     path: 'rooms',
//                     model: Rooms,
//                     select: 'eventName eventDescription lessonName code'
//                 })
//                 .then((user) => {
//                     return res.status(httpStatus.CREATED).send(user.rooms);
//                 })
//                 .catch((error) => {
//                     return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                         error: "Oda oluşturma sırasında bir hata oluştu.",
//                     });
//                 });
//         })
//         .catch((error) => {
//             return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 error: "Oda oluşturma sırasında bir hata oluştu.",
//             });
//         });
// };

const create = async (req, res)  => {
    const { eventName, eventDescription, lessonName } = req.body;
  
    // eventName, eventDescription ve lessonName kontrolü
    if (!eventName || !eventDescription || !lessonName) {
      return res.status(httpStatus.BAD_REQUEST).send({ message: 'Aktivite adı, aktivite açıklaması ve ders adı girilmesi zorunludur.' });
    }
  
    try {
      const createdBy = req.user._doc._id; // Kullanıcı kimliği alıdnı.
      const user = await User.findById(createdBy);
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).send({ message: 'Kullanıcı bulunamadı.' });
      }
      const room = await Rooms.create({ eventName, eventDescription, lessonName, createdBy });
      user.rooms.push(room._id);
      await user.save(); // Kullanıcının odalarına yeni oda ekleme
  
      const populatedRoom = await Rooms.findById(room._id).populate('createdBy', 'id email firstName lastName'); // Oluşturulan odayı kullanıcının bilgileriyle birlikte alın
      res.status(httpStatus.CREATED).send(populatedRoom);
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Sunucu hatası. Lütfen tekrar deneyin.' });
    }
}

const index = (req, res) => {
    Rooms.find({})
        .populate({
            path: 'createdBy',
            model: User,
            select: 'email firstName lastName'
        })
        .then((rooms) => {
            if (!rooms) {
                return res.status(httpStatus.NOT_FOUND).send({
                    error: "Hiçbir Oda Bulunamadı."
                });
            }

            const roomsList = rooms.map((room) => {
                let createdBy = null;
                if (room.createdBy) { // createdBy özelliğinin id özelliğine erişmeden önce kontrol edilir.
                    createdBy = {
                        id: room.createdBy.id,
                        email: room.createdBy.email,
                        firstName: room.createdBy.firstName,
                        lastName: room.createdBy.lastName,
                    };
                }

                return {
                    id: room.id,
                    eventName: room.eventName,
                    eventDescription: room.eventDescription,
                    lessonName: room.lessonName,
                    participants: room.participants,
                    code: room.code,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt,
                    createdBy: createdBy,
                };
            });

            res.status(httpStatus.OK).send(roomsList);
        })
        .catch((error) => {
            console.log(error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: "Odalar Getirilirken Hata Oluştu."
            });
        });
}

const getByIdRoom = (req, res) => {
    if (!req.params.id) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Oda Getirilirken Hata Oluştu." });
    }

    Rooms.findById(req.params.id)
        .populate({
            path: 'createdBy',
            model: User,
            select: 'email firstName lastName'
        })
        .then((room) => {
            if (!room) {
                return res.status(httpStatus.NOT_FOUND).send({ error: "Aradığınız Oda Bulunamadı." });
            }

            if (!room.createdBy) {
                return res.status(httpStatus.NOT_FOUND).send({ error: "Oda Sahibi Bulunamadı." });
            }

            const createdBy = {
                id: room.createdBy.id,
                email: room.createdBy.email,
                firstName: room.createdBy.firstName,
                lastName: room.createdBy.lastName,
            };

            const roomDetails = {
                id: room.id,
                eventName: room.eventName,
                eventDescription: room.eventDescription,
                lessonName: room.lessonName,
                participants: room.participants,
                code: room.code,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
                createdBy: createdBy,
            };

            res.status(httpStatus.OK).send(roomDetails);
        })
        .catch((error) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Oda Getirilirken Hata Oluştu." });
        });
};

const deleteRoom = (req, res) => {
    remove(req.params.id)
        .then((deletedItem) => {
            if (!deletedItem) {
                return res.status(httpStatus.NOT_FOUND).send({ message: "Böyle bir oda bulunmamaktadır." });
            }
            return res.status(httpStatus.OK).send({ message: "Oda silinmiştir." });
        })
        .catch((err) => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Silme işlemi sırasında hata ile karşılaşıldı." });
        });
};

// const JoinRoom = async (req, res) => {

//     const code = req.params.code;

//     const room = await Rooms.findOne({ code });

//     if (!room) {
//         return res.status(httpStatus.NOT_FOUND).send({ message: 'Geçersiz kod' });
//     }
//     const participant = new Participant({ room: room.id });
//     await participant.save();

//     let participants = room.participants || [];
//     participants.push(participant.name);
//     room.participants = participants;

//     await room.save();

//     return res.status(httpStatus.OK).send({ message: 'Katılım başarılı.', participant });
// };

const JoinRoom = async (req, res) => {

    const code = req.params.code;

    const room = await Rooms.findOne({ code });

    if (!room) {
        return res.status(httpStatus.NOT_FOUND).send({ message: 'Geçersiz kod' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const existingParticipant = await Participant.findOne({ room: room.id, ip: clientIp });

    if (existingParticipant) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'Aynı etkinliğe tekrardan katılamazsınız.', participant: existingParticipant });
    }

    const participant = new Participant({ room: room.id, ip: clientIp });
    await participant.save();

    let participants = room.participants || [];
    participants.push(participant.name);
    room.participants = participants;

    await room.save();

    return res.status(httpStatus.OK).send({ message: 'Katılım başarılı.', participant });
};

const getUserRooms = (req, res) => {
    const { _id } = req.user._doc;

    Rooms.find({ createdBy: _id })
        .populate({
            path: 'createdBy',
            model: User,
            select: 'email firstName lastName'
        })
        .then((rooms) => {
            res.status(httpStatus.OK).send(rooms);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Oda getirilirken hata ile karşılaşıldı." });
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