const express = require("express")
const ejs = require("ejs")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

const app = new express();
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.set('view engine', 'ejs');

mongoose.connect(
    "mongodb://localhost:27017/testDB",
    {
      useNewUrlParser: true,
    }, function(error) {
        if (error) {
            console.log("Error!" + error);
        }
        else
        {
            console.log("Connected to MongoDB");
            //console.log(mongoose);

        }
    });



const todoListSchema = {
    list: String,
    todoitems: [
      {
        SNo : Number,
        Task : String,
        CreatedDate : Date,
        CompleteDate : Date,
    }]
  };
  
  const TodoList = mongoose.model("TodoList", todoListSchema);

  app.get("/", function(req, res) {
    console.log("Redirecting to /list/home");
    res.redirect("/list/home");
  });

app.get("/list/:listName", function(req, res) {

    listToShow = req.params.listName;
    console.log("checking if " + listToShow + " exist");



    console.log("ListExists Start");
        TodoList.findOne({ list:listToShow}, function(err, foundTodoLists){
            console.log("mongo find one executed");
            if (err || foundTodoLists === null)
            {
                console.log("err or found TodoLists null");
                console.log(listToShow + " doesn't exist.");
                res.redirect("/newlist/" + listToShow);
            }        
            else
            {
                console.log("FoundTodoList ==> " + foundTodoLists);
                res.render("list", {ListName:foundTodoLists.list, TodoListData : foundTodoLists.todoitems});
            }     
            console.log("ListExists End");
        });

    
    


});

app.get("/newlist/:listName", function(req, res){
    newListName = req.params.listName;
    console.log("NewList Start");
    console.log("Creating list");

    newTask = {
      SNo : 1,
      Task : "Start here...",
      CreatedDate : new Date(),
      CompleteDate : ""
    }

    const newTodoList = new TodoList({
        list: newListName,
        todoitems: [newTask]
      });
      console.log("Saving Start");

      newTodoList.save(function(err){
        if (!err){
            console.log("redirecting to /list/" + newListName);
          res.redirect("/list/" + newListName);
        } else {
            console.log("Encountered error while saving list : \n" + err);
          res.send(err);
        }
      });            
});

app.post("/newtask", function(req, res){
  listName = req.body.listname;
  task = req.body.task;

  console.log("NewTask Start for list ==> "+listName);
  TodoList.findOne({ list:listName}, function(err, foundTodoLists){
      console.log("mongo find one executed");
      if (err || foundTodoLists === null)
      {
          console.log("err or found TodoLists null");
          console.log(listToShow + " doesn't exist.");
          res.redirect("list/" +foundTodoLists.list);
      }        
      else
      {

          console.log("Found list to modify ==> " + foundTodoLists);
          newTask = {
            SNo : foundTodoLists.todoitems.length+1,
            Task : task,
            CreatedDate : new Date(),
            CompleteDate : ""
          }
          console.log("TASK from form : "+task);
          console.log("LIST from form : "+listName);
          
          foundTodoLists.todoitems.push(newTask);
          console.log("ARRAY TO UPSERT ===> " +foundTodoLists.todoitems);


          TodoList.updateOne(
          { list: listName },
          { $set: { todoitems : foundTodoLists.todoitems } },
          { upsert: true }, // Make this update into an upsert
          function (err, docs) {
            if (err){
                console.log("Upsert errror" + err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
            res.redirect("list/" +foundTodoLists.list);
          });

      }     
      console.log("ListExists End");
  });

});

// function listExists() {
//     console.log("ListExists Start");
//     TodoList.findOne({ list:"home"}, function(err, foundTodoLists){
//         console.log("mongo findone executed");
//         if (err || foundTodoLists === null)
//         {
//             console.log("err or foundTodoLists null");
//             return false;
//         }        
//         else
//         {
//             console.log("FoundTodoList ==> " + foundTodoLists);
//             return true;
//         }
//         console.log("ListExists End");
//     });
// }


app.listen(3000, function(err){
    console.log("Listening on Port 3000");
});