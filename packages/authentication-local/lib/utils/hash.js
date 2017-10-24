const bcrypt = require('bcryptjs');

const BCRYPT_WORK_FACTOR_BASE = 12;
const BCRYPT_DATE_BASE = 1483228800000;
const BCRYPT_WORK_INCREASE_INTERVAL = 47300000000;

module.exports = function hasher (password) {
  return new Promise((resolve, reject) => {
    let BCRYPT_CURRENT_DATE = new Date().getTime();
    let BCRYPT_WORK_INCREASE = Math.max(0, Math.floor((BCRYPT_CURRENT_DATE - BCRYPT_DATE_BASE) / BCRYPT_WORK_INCREASE_INTERVAL));
    let BCRYPT_WORK_FACTOR = Math.min(19, BCRYPT_WORK_FACTOR_BASE + BCRYPT_WORK_INCREASE);

    bcrypt.genSalt(BCRYPT_WORK_FACTOR, function (error, salt) {
      if (error) {
        return reject(error);
      }

      bcrypt.hash(password, salt, function (error, hashedPassword) {
        if (error) {
          return reject(error);
        }

        resolve(hashedPassword);
      });
    });
  });
};
