const express = require("express");
const Task = require("../models/task.js");
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");

const router = express.Router();

// ================================ Endpoints for Task models API ============================
router.get("/task", auth,  (req ,res) => {
    res.render("task", {user: req.session.user});
});

// ================================ Endpoints for Task models API ============================

// Create Task
router.post("/api/tasks", apiAuth, async (req, res) => {
    const task = new Task(req.body);

    task.owner = req.session.user._id;

    try{
        await task.save();
        res.send(task);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read Tasks
router.get("/api/tasks", apiAuth, async (req, res) => {
    const searchText = req.query.search;
    var tasks = [];

    const userId = req.session.user._id;

    try{
        if(searchText){
            tasks = await Task.find({owner: userId, description: {$regex: searchText, $options: "i"}});
        }else{
            tasks =  await Task.find({owner: userId});
        }

        res.send(tasks);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read a Task
router.get("/api/tasks/:id", apiAuth, async (req, res) => {
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.session.user._id});

        if(task){
            return res.send(task);
        }

        res.send({error: "Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a Task
router.patch("/api/tasks/:id", apiAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user._id;

    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);


    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if(!isValid){
        return res.send({error: "Invalid update!"});
    }

    try{
        const task = await Task.findOneAndUpdate({_id: taskId, owner: userId}, req.body, {new: true});

        if(task){
            return res.send(task);
        }
        
        res.send({error: "Unable to update the task. Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Delete a Task
router.delete("/api/tasks/:id", apiAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user._id;

    try{
        const task = await Task.findByIdAndDelete({_id: taskId, owner: userId});

        if(task){
            return res.send(task);
        }

        res.send({error: "Unable to delete the task.Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

module.exports = router;