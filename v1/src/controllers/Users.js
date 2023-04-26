const httpStatus = require("http-status");
const uuid = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");
const path = require("path");
const Users = require("../models/Users");
const { passwordToHash, generateAccessToken, generateRefreshToken } = require("../scripts/utils/helper");
const { insert, list, loginUser, modify, remove, modifyWhere, deleteRoomsByUserId } = require("../services/Users");
const Rooms = require("../models/Rooms");

const create = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await Users.findOne({ email }).exec();

        if (existingUser) {
            return res.status(httpStatus.CONFLICT).send({ error: 'Email daha önce kullanılmış.' });
        }

        const hashedPassword = passwordToHash(password);
        const newUser = new Users({ firstName, lastName, email, password: hashedPassword });

        const savedUser = await insert(newUser);
        return res.status(httpStatus.CREATED).send(savedUser);

    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Kayıt sırasında bir hata ile karşılaşıldı." });
    }
};

// const index = async (req, res) => {
//     try {
//         const users = await Users.find().populate({
//             path: 'rooms',
//             select: 'eventName eventDescription lessonName code'
//         }).exec();

//         return res.status(httpStatus.OK).send(users);
//     } catch (err) {
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error : "Odalar getirilemedi."});
//     }
// };

const index = async (req, res) => {
    try {
        const users = await Users.find().populate('rooms', 'eventName eventDescription lessonName code');
        res.status(httpStatus.OK).send(users);
    } catch (error) {
        console.log(error); // hata kaydı konsola yazdırılıyor
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            error: "Kullanıcıları listeleme sırasında bir hata oluştu.",
        });
    }
};

const getOneUser = (req, res) => {
    const { _doc: user, refreshToken } = req.user; //req.user objesinden _doc özelliği alarak user değişkenine atadık. ve req.userdan refresh tokenıda aldık.
    const accessToken = req.headers.authorization.split(' ')[1];

    const responseData = { user, accessToken, refreshToken };
    res.send(responseData);
};

const login = (req, res) => {
    req.body.password = passwordToHash(req.body.password);
    loginUser(req.body)
        .then((user) => {
            if (!user) return res.status(httpStatus.NOT_FOUND).send({ message: "Girilen kullanıcı adı ya da şifre hatalı. Lütfen girdiğiniz bilgileri kontrol ederek tekrar deneyiniz." })
            user = {
                ...user.toObject(),
                tokens: {
                    access_token: generateAccessToken(user),
                    refresh_token: generateRefreshToken(user),
                },
            };
            res.status(httpStatus.OK).send(user);
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

// const login = async (req, res) => {
//     try {
//         const hashedPassword = passwordToHash(req.body.password);
//         const user = await loginUser({ ...req.body, password: hashedPassword }); // req.body'deki tüm özellikleri ... operatörü ile geçmiş oluyoruz.Email pass gibi.

//         if (!user) {
//             return res.status(httpStatus.NOT_FOUND).send({ message: "Girilen kullanıcı adı ya da şifre hatalı. Lütfen girdiğiniz bilgileri kontrol ederek tekrar deneyiniz." });
//         }

//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);
//         const userWithTokens = { ...user.toObject(), tokens: { access_token: accessToken, refresh_token: refreshToken } }; //Mongoose modelinin JSON nesnesini alarak, userWithTokens adlı bir obje oluşturuyoruz.

//         res.status(httpStatus.OK).send(userWithTokens);
//     } catch (err) {
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
//     }
// };

// const resetPassword = (req, res) => {
//     const new_password = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
//     modifyWhere({ email: req.body.email }, { password: passwordToHash(new_password) })
//         .then((updatedUser) => {
//             if (!updatedUser) {
//                 return res.status(httpStatus.NOT_FOUND).send({ error: "Böyle bir kullanıcı bulunmamaktadır." });
//             }
//             eventEmitter.emit("send_email", {
//                 to: updatedUser.email,
//                 subject: "Şifre Sıfırlama",
//                 html: `Talebiniz üzerine şifre sıfırlama işleminiz gerçekleşmiştir. <br /> Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın! <br /> Yeni Şifreniz : <b>${new_password}`
//             });
//             res.status(httpStatus.OK).send({
//                 message: "Şifre sıfırlama işlemi için sisteme kayıtlı e-posta adresinize gereken bilgileri gönderdik."
//             })
//         })
//         .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Şifre resetleme sırasında bir problem oluştu." }));
// };

const resetPassword = async (req, res) => {
    try {
        const newPassword = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
        const updatedUser = await modifyWhere({ email: req.body.email }, { password: passwordToHash(newPassword) });

        if (!updatedUser) {
            return res.status(httpStatus.NOT_FOUND).send({ error: "Böyle bir kullanıcı bulunmamaktadır." });
        }

        eventEmitter.emit("send_email", {
            to: updatedUser.email,
            subject: "Şifre Sıfırlama",
            html: `Talebiniz üzerine şifre sıfırlama işleminiz gerçekleşmiştir. <br /> Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın! <br /> Yeni Şifreniz : <b>${newPassword}`
        });

        res.status(httpStatus.OK).send({
            message: "Şifre sıfırlama işlemi için sisteme kayıtlı e-posta adresinize gereken bilgileri gönderdik."
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Şifre resetleme sırasında bir problem oluştu." });
    }
};

const update = async (req, res) => {
    try {
        const userId = req.user._doc._id;
        const updatedUser = await modify(userId, req.body);
        res.status(httpStatus.OK).send(updatedUser);
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: "Güncelleme işlemi sırasında bir problem oluştu." });
    }
};

const deleteUser = async (req, res) => {
    const id = req.params?.id;
    const userId = req.user?._doc?._id;

    if (!id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik.",
        });
    }

    if (userId === id) {
        try {
            const deletedUser = await Users.findByIdAndDelete(id);
            if (!deletedUser) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kullanıcı bulunmamaktadır.",
                });
            }

            const deletedRooms = await Rooms.deleteMany({ createdBy: id });
            console.log(`${deletedRooms.deletedCount} odaları silindi.`);

            res.status(httpStatus.OK).send({
                message: "Kullanıcı ve kullanıcının odaları başarıyla silinmiştir.",
            });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: "Silme işlemi sırasında bir hata oluştu.",
            });
        }
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({
            error: "Bu eylemi gerçekleştirmek için yetkiniz yok.",
        });
    }
};

const changePassword = async (req, res) => {
    const userId = req.params.id;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;
    const oldPasswordHash = passwordToHash(oldPassword);

    if (!req.user || req.user._doc._id !== userId) {
        return res.status(httpStatus.UNAUTHORIZED).send({ error: "Bu eylemi gerçekleştirmek için yetkiniz yok." });
    }

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).send({ error: "Kullanıcı bulunamadı." });
        }

        if (oldPasswordHash !== user.password) {
            return res.status(httpStatus.BAD_REQUEST).send({ error: "Eski şifreniz yanlış." });
        }

        // Eski şifre doğru, yeni şifre hashleniyor ve kaydediliyor
        const newPasswordHash = passwordToHash(newPassword);
        user.password = newPasswordHash;
        await user.save();

        return res.status(httpStatus.OK).send({ message: "Şifreniz başarıyla değiştirildi." });
    } catch (error) {
        console.error(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Şifreniz değiştirilirken bir hata ile karşılaşıldı." });
    }
};

const updateProfileImage = (req, res) => {
    //Resim Kontrol
    if (!req?.files?.profile_image) {
        return res.status(httpStatus.BAD_REQUEST).send({ error: "Bu işlemi yapabilmek için yeterli veriye sahip değilsiniz." })
    }

    //Upload İşlemi
    const extension = path.extname(req.files.profile_image.name);
    const fileName = `${req.user._doc._id}${extension}`;
    const folderPath = path.join(__dirname, "../", "uploads/users", fileName);
    req.files.profile_image.mv(folderPath, function (err) {
        if (err) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err });
        modify(req.user._doc._id, { profile_image: fileName })
            .then((updatedUser) => {
                res.status(httpStatus.OK).send(updatedUser);
            })
            .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Upload başarılı fakat kayıt sırasında bir problem oluştu." }))
    });
};


module.exports = {
    create,
    index,
    login,
    resetPassword,
    update,
    deleteUser,
    updateProfileImage,
    changePassword,
    getOneUser,
}