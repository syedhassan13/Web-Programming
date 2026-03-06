const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./user");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
const session = require("express-session");

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb://127.0.0.1:27017/studentDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));





// Register user
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: "You already have an account" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        // Create session
        req.session.user = username;

        // Send success
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error registering user" });
    }
});

// Login
app.post("/login", async (req,res)=>{

    const {username,password} = req.body;

    const user = await User.findOne({username});

    if(!user){
        return res.send("User not found");
    }

    const match = await bcrypt.compare(password,user.password);

    if(match){

        req.session.user = username;

          res.json({ success: true });
        } else {
            res.json({ success: false, message: "Invalid password" });
        }

});

app.get("/dashboard",(req,res)=>{

    if(!req.session.user){
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/public/dashboard.html");

});

app.get("/user",(req,res)=>{

    if(req.session.user){
        res.json({username:req.session.user});
    }else{
        res.json({username:null});
    }

});

app.get("/logout",(req,res)=>{

    req.session.destroy(()=>{
        res.redirect("/login.html");
    });

});
app.listen(3000,()=>{
    console.log("Server running on port 3000");
});