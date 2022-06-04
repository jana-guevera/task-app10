const express = require("express");
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const sendConfirmEmail = require("../utils/email.js");

const router = express.Router();

// ================================ Routes for user pages ============================

router.get("/", (req, res) => {
    if(req.session.user){
        req.session.user = undefined;
    }
    res.render("index", {msg: req.query.msg});
});

router.get("/profile", auth,  (req ,res) => {
    res.render("profile", {user: req.session.user});
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/confirm_email", async (req, res) => {
    const userId = req.query.userid;

    try{
        const user = await User.findByIdAndUpdate(userId, {emailconfirm: true});

        if(user){
            return res.redirect("/?msg=Email confirmed. Please login!");
        }

        return res.redirect("/");
    }catch(e){
        return res.redirect("/");
    }
});

// ================================ Endpoints for User models ============================

// Login
router.post("/api/login", async (req, res) => {
    const result = await User.findUserByCredentials(req.body.email, req.body.password);

    if(result.error){
        return res.send(result);
    }

    req.session.user = result;
    return res.send(result);
});

// Create User
router.post("/api/users", async (req, res) => {
    const user = new User(req.body);

    try{
        await user.save();
        res.send(user);
        sendConfirmEmail(user);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read Users
router.get("/api/users", async (req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read a User
router.get("/api/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id);

        if(user){
            return res.send(user);
        }
        
        res.send({error: "User not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a User
router.patch("/api/users", async (req, res) => {
    if(req.files){
        const result = await User.uploadImage(req.files.profileImage);

        if(result.error){
            return res.send(result);
        }

        req.body.profileImage = result.filename;
    }

    const allowedUpdates = ["name", "age", "password", "email", "profileImage"];
    const updates = Object.keys(req.body);

    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if(!isValid){
        return res.send({error: "Invalid update!"});
    }

    try{
        const user = await User.findById(req.session.user._id);
        const prevImage = user.profileImage;

        if(!user){
            return res.send({error: "Unable to update the user. User not found!"});
        }
        
        updates.forEach((update) => {
            user[update] = req.body[update]
        });

        await user.save();
        req.session.user = user;
        res.send(user);

        if(req.body.profileImage && prevImage !== "profile.png"){
            // Delete the prev image
            User.removeImage(prevImage);
        }
    }catch(e){
        res.send({error: e.message});
    }
});

// Delete a user
router.delete("/api/users/:id", async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);

        if(user){
            return res.send(user);
        }

        res.send({error: "Unable to delete the user. User not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});


module.exports = router;