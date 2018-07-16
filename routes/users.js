'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { User } = require('./models/user');

const router = express.Router();

router.post('/users', (req, res) => {
  return User
    .create({
      username,
      password,
      firstName,
      lastName
    })
    .then(user => {
      return res.status(201).location(`/api/users/${user.id}`).json(user.serialize());
    });
})

module.exports = router;
