const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./user");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/studentDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// Register user
app.post("/register", async (req,res)=>{
    const {username,password} = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
        username: username,
        password: hashedPassword
    });

    await user.save();

    res.json({message:"User Registered"});
});


// Login
app.post("/login", async (req,res)=>{
    const {username,password} = req.body;

    const user = await User.findOne({username:username});

    if(!user){
        return res.json({message:"User not found"});
    }

    const match = await bcrypt.compare(password,user.password);

    if(match){
        res.json({message:"Login Successful"});
    }else{
        res.json({message:"Invalid Password"});
    }
});

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});