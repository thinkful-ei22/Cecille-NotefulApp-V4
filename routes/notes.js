'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { getNotesHandler, getNoteByIdHandler, postNoteHandler, putNoteHandler, deleteNoteHandler } = require('../handlers/handlers-notes');

const Note = require('../models/note');
const Tag = require('../models/tag');
const Folder = require('../models/folder');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

const validateFolderId = function(folderId, userId) {
  if (folderId === undefined || folderId === '') {
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return Promise.reject(err);
  }
  return Folder.count({ _id: folderId, userId })
    .then(count => {
      if(count === 0) {
        const err = new Error('The `folderId` is not valid');
        err.status = 400;
        return Promise.reject(err);
      }
    })
}

const validateTagId = function(tags, userId) {
  if(tags === undefined) {
    return Promise.resolve();
  }
  if(!Array.isArray(tags)) {
    const err = new Error('The `tags` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }
  return Tag.find({ $and: [{ _id: { $in: tags }, userId }] })
    .then(results => {
      if(tags.length !== results.length) {
        const err = new Error('The `tags` array contains an invalid id');
        err.status = 400;
        return Promise.reject(err);
      }
    })
}

router.route('/')
  .get(getNotesHandler)
  .post(postNoteHandler)

router.route('/:id')
  .get(getNoteByIdHandler)
  .put(putNoteHandler)
  .delete(deleteNoteHandler)

module.exports = router;
