const validator = require("validator");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const ObjectId = mongoose.Types.ObjectId;
const path = require("path");
const fs = require("fs");

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        min: 0, 
        default: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: (value) => {
            if(!validator.isEmail(value)){
                throw new Error("Email is not valid");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: (value) => {
            if(value.toLowerCase().includes("password")){ 
                throw new Error("Password should not contain the word password!");
            }
        }
    },
    profileImage: {
        type: String,
        default: "profile.png"
    },
    emailconfirm:{
        type: Boolean,
        default: false
    }
});

userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcryptjs.hash(this.password, 8);
    }

    next();
});

userSchema.statics.findUserByCredentials = async (email, password) => {
    const user = await User.findOne({email: email});

    if(!user){
        return {error: "Invalid Credentials!"};
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if(!isMatch){
        return {error: "Invalid Credentials!"};
    }

    if(user.emailconfirm){
        return user;
    }

    return {error: "Please confirm your email!"}
 
}

userSchema.statics.uploadImage = async (file) => {
    const allowedFiles = ["png", "jpeg", "JPEG", "jpg"];

    const fileExt = file.name.split(".").pop();

    // Check if file is allowed
    if(!allowedFiles.includes(fileExt)){
        return res.send({error: "Please upload image files"});
    }

    const sizeLimit = 2 * 1024 * 1024;

    // Check if file size is allowed
    if(file.size > sizeLimit){
        return res.send({error: "File size should be less than 2mb!"});
    }

    const fileName = new ObjectId().toHexString() + "." + fileExt;
    // Save the file
    try{
        await file.mv(path.resolve("./public/images/" + fileName));
        return {filename: fileName}
    }catch(e){
        return {error: "Something went wrong. Unable to upload image!"}
    }
}

userSchema.statics.removeImage = (filename) => {
    fs.unlink("./public/images/" + filename, (e) => {
        if(e){
            console.log(e);
        }
    });
}

const User = mongoose.model("User", userSchema);

module.exports = User;