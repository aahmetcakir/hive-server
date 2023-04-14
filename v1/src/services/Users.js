const User = require("../models/Users");

const insert = (data) => {
    const user = new User(data);
    return user.save(); 
}

const list = () => {
    return User.find({});
}

const getUserById = (id) => {
    return User.findById(id);
}

const loginUser = (loginData) => {
    return User.findOne(loginData)
}

const modify = (userId, usersData) => {
    return User.findByIdAndUpdate(userId, usersData, { new: true });
};

const modifyWhere = (where, data) => {
    return User.findOneAndUpdate(where, data, { new: true });
}

const remove = (id) => {
    return User.findByIdAndDelete(id);
}


module.exports = {
    insert,
    list,
    loginUser,
    modify,
    remove,
    modifyWhere,
    getUserById
}