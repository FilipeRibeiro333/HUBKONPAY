const mongoose = require('mongoose');

function getModel(name, schema) {
  if (mongoose.models[name]) {
    return mongoose.models[name];
  }
  return mongoose.model(name, schema);
}

module.exports = { getModel };
