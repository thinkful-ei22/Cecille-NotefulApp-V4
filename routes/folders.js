'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Folder = require('../models/folder');
const Note = require('../models/note');
const { Strategy: jwtStrategy, ExtractJwt } = require('passport-jwt');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', getAllFoldersHandler);
router.get('/:id', getFolderByIdHandler);
router.post('/', postFolderById);
router.put('/:id', putFolderById);
router.delete('/:id', deleteFolderById);

module.exports = router;
