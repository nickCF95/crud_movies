const mongoose = require('mongoose')

const connectionString = process.env.MONGODB_URI;  
//const connectionString = process.env.MONGO_DB_URI;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    console.log('Database connected')
  }).catch(err => {
    console.error(err)
  })
  process.on('uncaughtException', () => {
    mongoose.connection.close()
})

