'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { getAllTagsHandler, getTagByIdHandler, postTagHandler, putTagHandler, deleteTagHandler} = require('../handlers/handlers-tags');

const Tag = require('../models/tag');
const Note = require('../models/note');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', getAllTagsHandler);
router.get('/:id', getTagByIdHandler);
router.post('/', postTagHandler);
router.put('/:id', putTagHandler);
router.delete('/:id', deleteTagHandler);

module.exports = router;
