const { Schema, model } = require('mongoose')
const categorySchema = new Schema({
  categoryName: String
})
categorySchema.set('toJSON', {
  transform: (document,returnedObject) => {
      returnedObject.id = returnedObject._id
      delete returnedObject._id
      delete returnedObject.__v
  }
})
const Category = model('Category', categorySchema)
module.exports = Category
