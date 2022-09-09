//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');
const _=require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-Ashutosh:AshutoshJha@cluster0.3pl2wmy.mongodb.net/todolistDB');

  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
const itemsSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model('Item', itemsSchema);
const item1=new Item(
{ name:'Buy Food'}
)
const item2=new Item(
{ name:'Cook Food'}
)
const item3=new Item(
{ name:'Eat Food'}
)
const defaultArray=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
/*Item.insertMany(defaultArray,function(err){
  if(err) console.log(err);
  else console.log("Successfully saved all the items to todolistDB");
})*/
app.get("/", function(req, res) {

//const day = date.getDate();

Item.find(function(err,items){
  if(items.length===0){
    Item.insertMany(defaultArray,function(err){
      if(err) console.log(err);
      else console.log("Successfully saved all the items to todolistDB");
    })
    res.redirect("/");
  }
  else{
      res.render("list", {listTitle: "Today", newListItems: items});
  }

})

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item(
  { name:itemName}
  )
  if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,lists){
    lists.items.push(item);
    lists.save();
    res.redirect("/" + listName);
  })
}
});
app.post("/delete",function(req,res){
  const Data=req.body.checkbox;
  const listName=req.body.deleteList;
  if(listName===' Today'){
  Item.deleteOne({_id:Data}, function(err){
    if(err) console.log(err);
    else console.log("Successfully Deleted One Document.");
  })
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName} , {$pull:{items:{_id:Data}}} , function(err,lists){
    if(!err){
      lists.save();
      res.redirect("/" + listName);
    }
  })
}
})
/*app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});*/
app.get('/:topic', function(req , res){
    const topic=_.capitalize(req.params.topic);
  List.findOne({name:topic},function(err,lists){
      if(lists)
      {
        res.render("list",{listTitle: lists.name, newListItems: lists.items})
      }else{
        const list=new List({
          name:topic,
          items:defaultArray
        })
        list.save();
        res.redirect('/'+topic);
      }
    })
});
app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if(port==null || port==""){
port=3000;
}
app.listen(port, function() {
  console.log("Server started successfully.");
});
