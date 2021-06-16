require('dotenv').config()
require('./mongo')
const express = require('express')
const app = express()
const cors = require('cors')
const Movie = require('./models/movie')
const Category = require('./models/category')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

app.use(cors())
app.use(express.json())
app.get('/', (request, response) => {
  response.send('<h1>Hello Konzortia Capital!</h1>')
})
app.get('/api/movies', (request, response) => {
  Movie.find({}).populate('category', 'categoryName -_id').then(movies => {
    response.json(movies)
  })
})
app.get('/api/categories', (request, response) => {
  Category.find({}).then(categories => {
    response.json(categories)
  })
})
app.get('/api/movies/:id', (request, response) => {
  const { id } = request.params
  Movie.findById(id).populate('category', 'categoryName -_id').then(movie => {
      if(movie){
        return response.json(movie)
      }else{
          response.status(404).end()
      }
  }).catch(err => next(err))
})
app.get('/api/categories/:id', (request, response) => {
    const { id } = request.params
    Category.findById(id).then(category => {
        if(category){
          return response.json(category)
        }else{
            response.status(404).end()
        }
    }).catch(err => next(err))
  })
app.put('/api/movies/:id', (request, response, next) => {
    const { id } = request.params
    const movie = request.body
    const newMovieInfo = { }
    if(movie.name){
        newMovieInfo.name = movie.name
    }
    if(movie.director){
        newMovieInfo.director = movie.director
    }
    if(movie.category){
        newMovieInfo.category = movie.category
    }
    Movie.findById(id).then( movie => {
      movie.name = newMovieInfo.name ?? movie.name;
      movie.director = newMovieInfo.director ?? movie.director;
      if (newMovieInfo.category && newMovieInfo.category.categoryName){
        Category.findOne({categoryName:newMovieInfo.category.categoryName}).then(category => {
          if(category){
            movie.category = category._id;
          }
          movie.save().then(result => {
            response.json(result);
          })
        })
      }
    }).catch(err => next(err))
  })
app.put('/api/categories/:id', (request, response, next) => {
const { id } = request.params
const category = request.body
const newCategoryInfo = {}
if(category.categoryName){
    newCategoryInfo.categoryName = category.categoryName
}
Category.findByIdAndUpdate(id, newCategoryInfo, { new:true }).then( result => {
    response.json(result)
}).catch(err => next(err))
})
app.delete('/api/movies/:id', (request, response, next) => {
  const { id } = request.params
  Movie.findByIdAndDelete(id).then( () => {
    response.status(204).end()
  }).catch(err => next(err))
})
app.delete('/api/categories/:id', (request, response, next) => {
    const { id } = request.params
    Category.findByIdAndDelete(id).then( () => {
      response.status(204).end()
    }).catch(err => next(err))
  })
app.post('/api/movies', (request, response) => {
  const movie = request.body
  console.log(movie)
  if (!movie || !movie.name || !movie.director || !movie.category) {
    return response.status(400).json({
      error: 'some field of movie is missing'
    })}
  const newMovie = new Movie({
    name: movie.name,
    director: movie.director,
    category: movie.category.id
  })
  newMovie.save().then(savedMovie => {
      response.json(savedMovie)
  })
})
app.post('/api/categories', (request, response) => {
    const category = request.body
    console.log(category)
    if (!category.categoryName) {
      return response.status(400).json({
        error: 'Name of category is missing'
      })
    }
    const newCategory = new Category({
      categoryName: category.categoryName
    })
    newCategory.save().then(savedCategory => {
        response.json(savedCategory)
    })
  })
app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
