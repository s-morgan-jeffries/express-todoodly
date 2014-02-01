var mongoose = require( 'mongoose'),
  Schema = mongoose.Schema;

var TodoSchema = new Schema({
  user_id: String,
  content: String,
  updated_at: Date
});

mongoose.model('Todo', TodoSchema);