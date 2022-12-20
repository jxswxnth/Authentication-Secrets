require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();
const port = process.env.PORT;
const secretString = process.env.SECRET;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

//configuring session
app.use(session({
  secret: secretString,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set({
  strictQuery: true
});
mongoose.connect("mongodb://localhost:27017/secrets1DB");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String
});

userSchema.plugin(findOrCreate);
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback: true
  },
  (request, accessToken, refreshToken, profile, done)=>{
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return done(err, user);
    });
  }
));

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
  .post((req, res) => {
    const user = User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

app.route("/auth/google")
  .get(passport.authenticate("google", {
    scope: ['email', 'profile']
  }));

app.route("/auth/google/secrets")
  .get(passport.authenticate("google", {
    successRedirect: '/secrets',
    failureRedirect: '/login'
  }));

app.route("/register")
  .get((req, res) => {
    res.render("pages/register");
  })
  .post((req, res) => {
    User.findOne({
      username: req.body.username
    }, (err, doc) => {
      if (!err && doc) {
        console.log("User already exists");
        res.redirect("/register");
      } else {
        // No need to use save(), since we're using passport-local-mongoose it takes care of saving user in db.
        // In User.register() we're sending only username since password will be stored as salt and hash in db.
        // User.register() saves user into our db.
        User.register({
          username: req.body.username
        }, req.body.password, (err, user) => {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, () => {
              res.redirect("/secrets");
            });
          }
        });
      }
    });
  });

app.route("/secrets")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      Secret.find((err, allSecrets) => {
        res.render("pages/secrets", {
          listOfSecrets: allSecrets
        });
      });
    } else {
      res.redirect("/login");
    }
  })

app.route("/submit")
  .get((req, res) => {
    res.render("pages/submit");
  })
  .post((req, res) => {
    const newSecret = Secret({
      secret: req.body.secret
    });
    newSecret.save();
    Secret.find((err, allSecrets) => {
      res.render("pages/secrets", {
        listOfSecrets: allSecrets
      });
    });
  });

app.route("/logout")
  .get((req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    })
  })


app.listen(port, (req, res) => {
  console.log(`App is listening at port ${port}`);
})
