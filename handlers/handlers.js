const mongoose = require('mongoose');

const Folder = require('../models/folder');
const Note = require('../models/note');

const getAllHandler = (req, res, next) => {
  const userId = req.user.id;

  Folder.find({ userId })
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
}
