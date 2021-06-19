module.exports = (error, request, response, next) => {
    console.error(error)
    if (error.name === 'CastError'){
        response.status(400).send({error:'Id used is malformed, an ObjectId is expected'});
    }else if(error.name === 'NullError'){
        response.status(404).send({error: error.msg});
    }else if(error.name === 'ConflictError'){
        response.status(409).send({error: error.msg});
    }
    else if(error.name === 'MissingFieldsError'){
        response.status(400).send({error: error.msg});
    }else{
        response.status(500).end();
    }    
}