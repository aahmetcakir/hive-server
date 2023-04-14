const Joi = require("joi");

const createValidation = Joi.object({
    password: Joi.string().required().min(5),
})

module.exports = {
    createValidation,
}