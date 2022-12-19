require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=  require("mongoose");
const md5 = require("md5");

const app = express();
const port = process.env.PORT;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

mongoose.set({strictQuery: true});
mongoose.connect("mongodb://localhost:27017/secrets1DB");

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User",userSchema);

const secretSchema = new mongoose.Schema({
  secret: String
});
const Secret = mongoose.model("Secret", secretSchema);

app.route("/")
  .get((req, res) => {
    res.render("pages/home");
  });

app.route("/login")
  .get((req, res) => {
    res.render("pages/login");
  })
  .post((req,res)=>{
    User.findOne({
      username: req.body.username,
      password: md5(req.body.password)
    },(err,doc)=>{
      if(!err){
        if(doc){
          Secret.find((err,allSecrets)=>{
            res.render("pages/secrets",{
              listOfSecrets: allSecrets
            });
          });
        }
        else{
          res.redirect("/login");
        }
      }
    });
  });

app.route("/register")
  .get((req, res) => {
    res.render("pages/register");
  })
  .post((req,res)=>{
    User.findOne({username: req.body.username},(err,doc)=>{
      if(!err && doc){
        res.send("User already exist");
      }
      else{
        const newUser = User({
          username: req.body.username,
          password: md5(req.body.password)
        });
        newUser.save();
        res.redirect("/login");
      }
    });
  });

app.route("/submit")
  .get((req, res) => {
    res.render("pages/submit");
  })
  .post((req,res)=>{
    const newSecret = Secret({
      secret: req.body.secret
    });
    newSecret.save();
    Secret.find((err,allSecrets)=>{
      res.render("pages/secrets",{
        listOfSecrets: allSecrets
      });
    });
  });

app.route("/logout")
.get((req,res)=>{
  res.redirect("/");
})


app.listen(port, (req, res) => {
  console.log(`App is listening at port ${port}`);
})
