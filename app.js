require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=  require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();
const port = process.env.PORT;
const secretString = process.env.SECRET;


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
userSchema.plugin(encrypt,{secret: secretString, encryptedFields: ['password']});
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
    const password = req.body.password;
    User.findOne({ //using find we're decrypting the password and after that
      //we can use password as string and we can compare it
      //with user entered password at login
      username: req.body.username
// we cannot use direct find doc with both username and password, because password is not yet present before completion of find method
    },(err,doc)=>{
      if(!err){
        if(doc){
          if(doc.password === password){
          Secret.find((err,allSecrets)=>{
            res.render("pages/secrets",{
              listOfSecrets: allSecrets
            });
          });
          }
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
          password: req.body.password
        });
        newUser.save(); //using save we're encrypting the password
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
