const routes = require('express').Router();

const Note = require('../models/Note');
const {isAuthenticated} = require('../helpers/auth');

routes.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note');
});

routes.post('/notes/new-note', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please Write a Title'});
    }
    if(!description){
        errors.push({text: 'Please Write a Description'});
    }
    if(errors.length > 0){
        res.render('notes/new-note', {
            errors,
            title,
            description
        })
    }else{
        const newNote = Note({title, description});
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note Added Successfull');
        res.redirect('/notes');
    }
});

routes.get('/notes', isAuthenticated, async (req, res) => {
    const documents = await Note.find({user: req.user.id}).sort({date: 'desc'});
	const collection = [];
	documents.forEach(document => {
		collection.push({
            id: document.id,
			title: document.title,
			description: document.description,
		});
	});
    res.render('notes/all-notes', {notes: collection});
});

routes.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id)
    .then(data =>{
        return {
            title:data.title,
            description:data.description,
            id:data.id
        };
    });
    res.render('notes/edit-note',{note});
});

routes.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    await Note.findByIdAndUpdate(req.params.id, {title, description});
    req.flash('success_msg', 'Note Updated Successfully');
    res.redirect('/notes');
});

routes.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Note Deleted Successfully');
    res.redirect('/notes');
});

module.exports = routes;