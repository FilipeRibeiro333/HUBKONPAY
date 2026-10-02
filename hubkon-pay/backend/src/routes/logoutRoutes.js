const express = require('express');
const RefreshToken = require('../models/refreshTokenModel');

const router = express.Router();

router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie('refreshToken').json({ message: 'Logout efetuado com sucesso' });
});

module.exports = router;
