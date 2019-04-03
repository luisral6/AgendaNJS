const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "todo";
const app = express();
const schema = Joi.object().keys({
    name : Joi.string().required(),
    lastName :  Joi.string() ,
    address :  Joi.string() ,
    email : Joi.string().email(),
    phone : Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required() ,
    phoneType :  Joi.string().required()

});

app.use(bodyParser.json());


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});


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


app.put('/:id',(req,res,next)=>{
    const todoID = req.params.id;
    const userInput = req.body;

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


app.post('/',(req,res,next)=>{
    const userInput = req.body;

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
