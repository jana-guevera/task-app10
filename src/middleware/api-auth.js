const apiAuth = (req, res, next) => {
    if(!req.session.user){
        return res.send({error: "You are not authorised. Please login!"});
    }   
    
    next();
}

module.exports = apiAuth;