'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { getAllTagsHandler, getTagByIdHandler, postTagHandler, putTagHandler, deleteTagHandler} = require('../handlers/handlers-tags');

const Tag = require('../models/tag');
const Note = require('../models/note');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.route('/')
  .get(getAllTagsHandler)
  .post(postTagHandler)

router.route('/:id')
  .get(getTagByIdHandler)
  .put(putTagHandler)
  .delete(deleteTagHandler)

module.exports = router;
