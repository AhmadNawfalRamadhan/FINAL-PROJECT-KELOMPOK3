const bcrypt = require('bcryptjs');
const { Admin } = require('../models');
exports.login = async (req,res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return res.status(401).json({ message:'Email atau password salah.' });
  req.session.adminId = admin.id;
  res.json({ message:'Login berhasil.', admin:{ id:admin.id, name:admin.name, email:admin.email } });
};
exports.me = async (req,res) => {
  if (!req.session.adminId) return res.status(401).json({ message:'Belum login.' });
  const admin = await Admin.findByPk(req.session.adminId, { attributes:['id','name','email'] });
  res.json(admin);
};
exports.logout = (req,res) => req.session.destroy(() => res.json({ message:'Logout berhasil.' }));
