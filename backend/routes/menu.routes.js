const r=require('express').Router(); const c=require('../controllers/menu.controller'); const {requireAdmin}=require('../middleware/auth'); const upload=require('../middleware/upload');
r.get('/',c.list); r.post('/',requireAdmin,upload.single('image'),c.create); r.put('/:id',requireAdmin,upload.single('image'),c.update); r.delete('/:id',requireAdmin,c.remove); module.exports=r;
