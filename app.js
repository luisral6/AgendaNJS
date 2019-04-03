const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "todo";
const app = express();

// schema used for data validation for our todo document
const schema = Joi.object().keys({
    name : Joi.string().required(),
    lastName :  Joi.string() ,
    address :  Joi.string() ,
    email : Joi.string().email(),
    phone : Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required() ,
    phoneType :  Joi.string().required()

});

// parses json data sent to us by the user
app.use(bodyParser.json());

// serve static html file to user
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});

// read
app.get('/getTodos',(req,res)=>{
    // get all Todo documents within our todo collection
    // send back to user as json
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});

// update
app.put('/:id',(req,res,next)=>{
    // Primary Key of Todo Document we wish to update
    const todoID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update

    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Input invalido");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {
                    name : userInput.name,
                    lastName: userInput.lastName,
                    address: userInput.address,
                    email: userInput.email,
                    phone: userInput.phone,
                    phoneType: userInput.phoneType
            }},{returnOriginal : false},(err,result)=>{
                if(err)
                    console.log(err);
                else{
                    res.json(result);
                }
            });
        }
    })

});


//create
app.post('/',(req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // Validate document
    // If document is invalid pass to error middleware
    // else insert document within todo collection
    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Input invalido");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Error al guardar el contacto");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Contacto guardado",error : null});
            });
        }
    })
});



//delete
app.delete('/:id',(req,res)=>{
    // Primary Key of Todo Document
    const todoID = req.params.id;
    // Find Document By ID and delete document from record
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});

// Middleware for handling Error
// Sends Error Response Back to User
app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})


db.connect((err)=>{
    // If err unable to connect to database
    // End application
    if(err){
        console.log('Error al conectarse a la DB');
        process.exit(1);
    }
    // Successfully connected to database
    // Start up our Express Application
    // And listen for Request
    else{
        app.listen(3000,()=>{
            console.log('Conectado a la DB. Usando el puerto 3000');
        });
    }
});
