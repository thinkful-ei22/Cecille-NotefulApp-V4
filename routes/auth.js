const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config')

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/login', localAuth, function (req, res) {
  const authToken = createAuthToken(req.user);
  return res.json({ authToken });
});

module.exports = router;
