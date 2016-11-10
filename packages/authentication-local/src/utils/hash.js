import bcrypt from 'bcryptjs';

export default function hasher (password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (error, salt) {
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
}
