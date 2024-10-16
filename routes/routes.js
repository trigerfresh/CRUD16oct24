const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer')
const fs = require('fs');

//Image upload
var storage = multer.diskStorage({
    destination : function(req, res, cb){
        cb(null, './uploads');
    }, 
    filename : function(req, file, cb){
        cb(null, Date.now()+"_"+file.originalname);
    }
})

var upload = multer({
    storage : storage,
}).single('image');

// Insert an user in to database route
router.post('/add', upload, (req, res)=>{
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : req.file.filename,
    });
    user.save()
    .then(res.redirect('/'))
    .catch((err)=>{
        res.json({message : err.message, type : 'danger'});
    });
});

//Get all users route

router.get('/', async(req,res)=>{
    try{
        const users = await User.find().exec();
        res.render('index', {
            title : "Home Page",
            users : users,
        });
    }catch(err){
        res.json({
            message : err.message
        });
    }
});

router.get('/add', (req, res)=>{
    res.render('add_users', { title: "Add Users"})
});

//Edit an user route
router.get('/edit/:id', async (req, res)=>{
    let id = req.params.id;
    
    try{
    let user = await User.findById(id)
    res.render("edit_user", {
        title: "Edit Users",
        user: user,
    })}catch(err){
        res.redirect('/');
    }
});

router.post("/update/:id", upload, async (req, res)=>{
    let id = req.params.id;
    let new_image = "";
    
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync("./uploads/"+req.body.old_image);
        }catch(err){
            alert(err);
        }
    }else{
        new_image = req.body.old_image;
    }
    
    try{
    let user = await User.findByIdAndUpdate(id, {
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : new_image,
    }, req.session.message = {
        type : "success",
        message : "User updated successful."
    })
    user.save()
    res.redirect('/')
}catch(err){
    res.json({message : err.message, type : 'danger'});
}
})

// Delete user route

router.get('/delete/:id', async (req, res)=>{
    let id = req.params.id;

    if(req.file != ""){
        try{
            fs.unlinkSync('./uploads'+req.file.filename);
        }catch(err){
            console.log(err);
        }
    }

    try{
    await User.findByIdAndDelete(id, req.file);
    res.redirect('/');
    }catch(err){
        res.json({message : err.message, type : 'danger'});
    }
})

module.exports = router;