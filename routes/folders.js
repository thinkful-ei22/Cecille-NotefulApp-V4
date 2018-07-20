'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { getAllFoldersHandler, getFolderByIdHandler, postFolderHandler, putFolderHandler, deleteFolderHandler} = require('../handlers/handlers-folders');

const Folder = require('../models/folder');
const Note = require('../models/note');
const { Strategy: jwtStrategy, ExtractJwt } = require('passport-jwt');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.route('/')
  .get(getAllFoldersHandler)
  .post(postFolderHandler)

router.route('/:id')
  .get(getFolderByIdHandler)
  .put(putFolderHandler)
  .delete(deleteFolderHandler)

module.exports = router;
