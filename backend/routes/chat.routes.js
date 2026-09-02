const r=require('express').Router(); const c=require('../controllers/chat.controller'); r.post('/message',c.message); r.post('/confirm',c.confirm); module.exports=r;
