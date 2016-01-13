import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  email: {type: String, required: true, index: true},
  password: {type: String, required: true},
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});

let UserModel = mongoose.model('User', UserSchema);

export default UserModel;