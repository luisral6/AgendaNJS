const express = require('express');
const bodyParser = require( 'body-parser');
const app = express();
app.use(bodyParser.json());
const path =require('path');

const db = require('./db');
const collection ="todo";

//redirection to homepage
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});


app.get('/getTodos',(req,res)=>{
  db.getDB().collection(collection).find({}).toArray((err,documents)=>{
      if (!err) {
          console.log(documents);
          res.json(documents);

      } else {
          console.log(err);
      }
  })
});

app.put('/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const todoID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo}},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});

// db connection
db.connect((err)=>{
  if(err){
    console.log(err);
    console.log("Unable to connect to db");
    process.exit(1 );
  }else{
    app.listen(3000,()=>{
      console.log("Connected to db, on port 3000");
    });
  }
})

