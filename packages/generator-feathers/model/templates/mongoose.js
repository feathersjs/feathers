// <%= name %>.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let <%= name %>Schema = new Schema({
  name: {type: String, required: true, index: true},
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});

let <%= name %>Model = mongoose.model('<%= name %>', <%= name %>Schema);

export default <%= name %>Model;