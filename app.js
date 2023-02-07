require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const FacebookStrategy = require("passport-facebook").Strategy;

const app = express();
const port = process.env.PORT;
const secretString = process.env.SECRET;
const databaseURL = process.env.DB_URL;

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
mongoose.connect(databaseURL);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  secret: String
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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback: true
  },
  (request, accessToken, refreshToken, profile, done) => {
    User.findOrCreate({
      googleId: profile.id
    }, (err, user) => {
      return done(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    User.findOrCreate({
      facebookId: profile.id
    }, (err, user) => {
      return done(err, user);
    });
  }
));

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
      failureRedirect: "/login"
    }),
    (req, res) => {
      res.redirect("/secrets");
    });

app.route("/auth/facebook")
  .get(passport.authenticate("facebook", {
    scope: "public_profile"
  }));

app.route("/auth/facebook/secrets")
  .get(passport.authenticate("facebook", {
      failureRedirect: "/login"
    }),
    (req, res) => {
      res.redirect("/secrets");
    });

app.route("/register")
  .get((req, res) => {
    res.render("pages/register");
  })
  .post((req, res) => {
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
  });
const allSecrets = [];
app.route("/secrets")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      User.find({secret: {$ne: null}},(err,users)=>{
        res.render("pages/secrets", {
          listOfUsers: users
        });
      })
    } else {
      res.redirect("/login");
    }
  })

app.route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("pages/submit");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    console.log(req.user);
    console.log(req.body);
    User.updateOne({
      _id: req.user._id
    }, {
      secret: req.body.secret
    }, (err) => {
      if (err) {
        console.log(err);
      }
    })
    res.redirect("/secrets");
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
