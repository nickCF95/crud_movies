require('dotenv').config()
require('./mongo')
const ObjectId  = require('mongodb').ObjectId;
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
app.get('/api/movies/:id', (request, response, next) => {
  const { id } = request.params
  Movie.findById(id).populate('category', 'categoryName -_id').then(movie => {
    if(movie){
      return response.json(movie)
    }else{
      const err = {
        name: 'NullError',
        msg: 'The searched movie does not exist'
      };
      next(err)
    }
  }).catch(err => next(err))
})
app.get('/api/categories/:id', (request, response, next) => {
    const { id } = request.params
    Category.findById(id).then(category => {
        if(category){
          return response.json(category)
        }else{
          const err = {
            name: 'NullError',
            msg: 'The searched category does not exist'
          };
          next(err)
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
      movie.category = newMovieInfo.category.id ?? movie.category;      
      if (newMovieInfo.category.categoryName && !newMovieInfo.category.id){
        Category.findOne({categoryName:newMovieInfo.category.categoryName}).then(category => {  
          if(category){
            movie.category = category._id; 
            movie.save().then(result => {
              response.json(result);
            })           
          }else{
            const err = {
              name: 'NullError',
              msg: 'The category that you want to set does not exist'
            };
            next(err);
          }          
        })      
      }else{
        movie.save().then(result => {
          response.json(result);
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
    Category.findById(id).then( resCategory => {
      if(resCategory){
        const condition = new ObjectId(resCategory._id);
        Movie.find({category: condition}).then( movie => {
          if (!movie){
            Category.findByIdAndDelete(resCategory.id).then( () => {
              response.status(204).end();
            }).catch(err => next(err))
          }else{
            const error = {
              name: 'ConflictError' ,
              msg: `There are movies associated to category: ${resCategory.categoryName}`
            };
            next(error);          
          }
        })
      }else{
        const err = {
          name: 'NullError',
          msg: 'The category you want to delete does not exist'
        };
        next(err);
      }      
    }).catch(err => next(err))
  })
app.post('/api/movies', (request, response, next) => {
  const movie = request.body;
  if (!movie || !movie.name || !movie.director || !movie.category) {
      const error = {
        name: 'MissingFieldsError',
        msg: 'Some field/s of movie object is missing'
      };
      next(error);
  }else{
    const newMovie = new Movie({
      name: movie.name,
      director: movie.director,
      category: movie.category.id
    });
    newMovie.save().then(savedMovie => {
        response.json(savedMovie)
    })
  }
})
app.post('/api/categories', (request, response) => {
    const category = request.body
    if (!category.categoryName) {
      const error = {
        name: 'MissingFieldsError',
        msg: 'Name of category is missing'
      };
      next(error);
    }else{
      const newCategory = new Category({
        categoryName: category.categoryName
      });
      newCategory.save().then(savedCategory => {
          response.json(savedCategory)
      });
    }    
  })
app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
