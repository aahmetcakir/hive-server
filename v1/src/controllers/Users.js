const httpStatus = require("http-status");
const uuid = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");
const path = require("path");
const Users = require("../models/Users");
const { passwordToHash, generateAccessToken, generateRefreshToken } = require("../scripts/utils/helper");
const { insert, list, loginUser, modify, remove, modifyWhere, getUserById } = require("../services/Users");

const create = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await Users.findOne({ email }).exec();
    if (existingUser) {
        return res.status(httpStatus.CONFLICT).send({ error: 'Email daha önce kullanılmış.' });
    }

    const hashedPassword = passwordToHash(password);
    const newUser = new Users({ firstName, lastName, email, password: hashedPassword, });

    try {
        const savedUser = await insert(newUser);
        res.status(httpStatus.CREATED).json(savedUser);
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
    }
};


const index = (req, res) => {
    list()
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

const getOneUser = (req, res) => {
    const user = req.user._doc;
    const accessToken = req.headers.authorization.split(' ')[1];
    const refreshToken = req.user.refreshToken;
    res.send({
        user,
        accessToken,
        refreshToken
    });
}

const login = (req, res) => {
    req.body.password = passwordToHash(req.body.password);
    loginUser(req.body)
        .then((user) => {
            if (!user) return res.status(httpStatus.NOT_FOUND).send({ message: "Böyle bir kullanıcı bulunmamaktadır. Mail adresiniz veya şifreniz yanlış olabilir." })
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

const resetPassword = (req, res) => {
    const new_password = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
    modifyWhere({ email: req.body.email }, { password: passwordToHash(new_password) })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(httpStatus.NOT_FOUND).send({ error: "Böyle bir kullanıcı bulunmamaktadır." });
            }
            eventEmitter.emit("send_email", {
                to: updatedUser.email,
                subject: "Şifre Sıfırlama",
                html: `Talebiniz üzerine şifre sıfırlama işleminiz gerçekleşmiştir. <br /> Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın! <br /> Yeni Şifreniz : <b>${new_password}`
            });
            res.status(httpStatus.OK).send({
                message: "Şifre sıfırlama işlemi için sisteme kayıtlı e-posta adresinize gereken bilgileri gönderdik."
            })
        })
        .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Şifre resetleme sırasında bir problem oluştu." }));
};

const update = (req, res) => {
    modify(req.user._doc._id, req.body)
        .then((updatedUser) => {
            res.status(httpStatus.OK).send(updatedUser);
        })
        .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Güncelleme işlemi sırasında bir problem oluştu." }))
};

const deleteUser = (req, res) => {
    if (!req.params?.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik.",
        });
    }

    if (req.user && req.user._doc._id === req.params.id) {
        remove(req.params.id)
            .then((deletedItem) => {
                if (!deletedItem) {
                    return res.status(httpStatus.NOT_FOUND).send({
                        message: "Böyle bir kayıt bulunmamaktadır.",
                    });
                }
                res.status(httpStatus.OK).send({
                    message: "Kayıt silinmiştir.",
                });
            })
            .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Silme işlemi sırasında hata ile karşılaşıldı." }));
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({ error: "Bu eylemi gerçekleştirmek için yetkiniz yok." });
    }
};


//  const changePassword = (req, res) => {
//      if (req.user && req.user._doc._id === req.params.id) {
//          if (req.body.password) {
//              req.body.password = passwordToHash(req.body.password);
//          }
//          modify(req.params.id, req.body)
//              .then((result) => {
//                  res.status(httpStatus.OK).send(result);
//              })
//              .catch((err) => {
//                  res.status(httpStatus.NOT_FOUND).send(err);
//              });
//      } else {
//          res.status(httpStatus.UNAUTHORIZED).send({error : "Bu eylemi gerçekleştirmek için yetkiniz yok."});
//      }
//  };

const changePassword = async (req, res) => {

    const userId = req.params.id;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;
    const oldPasswordHash = passwordToHash(oldPassword);


    if (req.user && req.user._doc._id === req.params.id) {
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

            return res.status(httpStatus.OK).send({ error: "Şifreniz başarıyla değiştirildi." });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "Şifreniz değiştirilirken bir hata ile karşılaşıldı." });
        }
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({ error: "Bu eylemi gerçekleştirmek için yetkiniz yok." });
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