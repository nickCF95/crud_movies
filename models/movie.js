const { Schema, model } = require('mongoose')
const movieSchema = new Schema({
  name: String,
  director: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
})
movieSchema.set('toJSON', {
    transform: (document,returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Movie = model('Movie', movieSchema)
module.exports = Movie
