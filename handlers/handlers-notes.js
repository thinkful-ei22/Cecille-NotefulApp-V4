const mongoose = require('mongoose');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');
const { getAllNotesHandler, getNoteByIdHandler, postNoteHandler, putNoteHandler, deleteNoteHandler } = require('../handlers/handlers-notes');

const getAllNotesHandler = (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  const userId = req.user.id;

  let filter = { userId };

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
}

const getNoteByIdHandler = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
}

const postNoteHandler = (req, res, next) => {
  const { title, content, folderId, tags = [] } = req.body;
  const userId = req.user.id;
  const newNote = { title, content, tags, userId };


  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if(folderId) {
    newNote.folderId = folderId;
  }

  if (tags) {
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The tags `id` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagId(tags, userId)
  ])
  .then(() => Note.create(newNote))
  .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
}

const putNoteHandler = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, content, folderId, tags = [] } = req.body;
  const updateNote = { title, content, tags, userId };

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if(folderId) {
    updateNote.folderId = folderId;
  }

  if (tags) {
    const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The tags `id` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagId(tags, userId)
  ])
  .then(() =>
    Note
      .findOneAndUpdate({ _id: id, userId }, updateNote, { new: true }))
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
  });
}

const deleteNoteHandler = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
}

module.exports = { getAllNotesHandler, getNoteByIdHandler, postNoteHandler, putNoteHandler, deleteNoteHandler};
