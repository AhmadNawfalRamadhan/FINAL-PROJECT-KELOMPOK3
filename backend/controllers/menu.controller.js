const fs = require('fs');
const path = require('path');
const { MenuItem } = require('../models');
exports.list = async (_,res) => res.json(await MenuItem.findAll({ order:[['id','ASC']] }));
exports.create = async (req,res) => {
  const data = { ...req.body, price:Number(req.body.price), stock:Number(req.body.stock || 0), isAvailable:req.body.isAvailable !== 'false' };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  res.status(201).json(await MenuItem.create(data));
};
exports.update = async (req,res) => {
  const item = await MenuItem.findByPk(req.params.id); if (!item) return res.status(404).json({message:'Menu tidak ditemukan.'});
  const data = { ...req.body };
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.stock !== undefined) data.stock = Number(data.stock);
  if (data.isAvailable !== undefined) data.isAvailable = data.isAvailable !== 'false';
  if (req.file) {
    if (item.image?.startsWith('/uploads/')) { const old=path.join(__dirname,'..',item.image); if(fs.existsSync(old)) fs.unlinkSync(old); }
    data.image = `/uploads/${req.file.filename}`;
  }
  await item.update(data); res.json(item);
};
exports.remove = async (req,res) => { const item=await MenuItem.findByPk(req.params.id); if(!item)return res.status(404).json({message:'Menu tidak ditemukan.'}); await item.destroy(); res.json({message:'Menu dihapus.'}); };
