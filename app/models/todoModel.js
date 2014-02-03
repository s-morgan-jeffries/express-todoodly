'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TodoSchema = new Schema({
  content: {
    type: String,
    default: '',
    trim: true
  },
  isDone: {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

// You can pass functions with two arguments to one of hooks-js's methods, but I'm not entirely sure how that works.
// Note that the second argument, done, isn't used in this case.
TodoSchema.pre('save', function(next /*, done*/){
  if (this.isNew) {
    this.createdAt = Date.now();
    this.isDone = false;
  }
  next();
});

mongoose.model('Todo', TodoSchema);