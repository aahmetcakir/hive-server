const Joi = require("joi");

const createValidation = Joi.object({
    firstName: Joi.string().trim().required().min(3).messages({
        'any.required': 'Adınızı giriniz.',
        'string.min': 'Adınız en az 3 karakter içermelidir.',
        'string.empty': 'İsim alanı boş geçilemez',
    }),
    lastName: Joi.string().trim().required().min(3).messages({
        'any.required': 'Soyadınızı giriniz.',
        'string.min': 'Soyadınız en az 3 karakter içermelidir.',
        'string.empty': 'Soyisim alanı boş geçilemez',
    }),
    email: Joi.string().trim().email().required().min(8).messages({
        'any.required': 'E-posta adresinizi giriniz.',
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'string.min': 'E-posta adresiniz en az 8 karakter içermelidir.',
        'string.empty': 'Email alanı boş geçilemez',
    }),
    password: Joi.string().trim().required().min(8).messages({
        'any.required': 'Şifrenizi giriniz.',
        'string.min': 'Şifreniz en az 8 karakter içermelidir.',
        'string.empty': 'Şifre alanı boş geçilemez',
    }),
})

const updateValidation = Joi.object({
    firstName: Joi.string().trim().min(3).messages({
        'string.min': 'İsim en az 3 karakter içermelidir.',
        'string.empty': 'İsim alanı boş geçilemez',
    }),
    lastName: Joi.string().trim().min(3).empty('').messages({
        'string.min': 'Soyisim en az 3 karakter içermelidir.',
        'string.empty': 'Soyisim alanı boş geçilemez',
    }),
});


const loginValidation = Joi.object({
    email: Joi.string().trim().email().required().min(8).empty('').messages({
        'any.required': 'E-posta adresinizi giriniz.',
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'string.min': 'E-posta adresiniz en az 8 karakter içermelidir.',
        'string.empty': 'Email alanı boş geçilemez',
    }),
    password: Joi.string().trim().required().min(8).empty('').messages({
        'any.required': 'Şifrenizi giriniz.',
        'string.min': 'Şifreniz en az 8 karakter içermelidir.',
        'string.empty': 'Şifre alanı boş geçilemez',
    }),
});

const resetPasswordValidation = Joi.object({
    email: Joi.string().trim().email().required().min(8).empty('').messages({
        'any.required': 'E-posta adresinizi giriniz.',
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'string.min': 'E-posta adresiniz en az 8 karakter içermelidir.',
        'string.empty': 'Email alanı boş geçilemez',

    }),

});


const changePasswordValidation = Joi.object({
    newpassword: Joi.string().required().min(8).empty('').messages({
        'any.required': 'Yeni şifrenizi giriniz.',
        'string.min': 'Yeni şifreniz en az 8 karakter içermelidir.',
        'string.empty': 'Yeni şifre alanı boş geçilemez',
    }),
    oldpassword: Joi.string().required().min(8).empty('').messages({
        'any.required': 'Eski şifrenizi giriniz.',
        'string.min': 'Eski şifreniz en az 8 karakter içermelidir.',
        'string.empty': 'Mevcut şifre alanı boş geçilemez',
    }),
});

module.exports = {
    createValidation,
    loginValidation,
    resetPasswordValidation,
    updateValidation,
    changePasswordValidation,
}