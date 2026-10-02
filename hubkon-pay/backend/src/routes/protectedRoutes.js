const express = require('express');
const router = express.Router();
const can = require('../middlewares/roleMiddleware');

router.get('/admin', can('admin'), (req, res) => {
  res.json({ message: 'Acesso admin permitido' });
});

router.get('/user', can('user'), (req, res) => {
  res.json({ message: 'Acesso user permitido' });
});

module.exports = router;
