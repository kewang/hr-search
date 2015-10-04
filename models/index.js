'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

console.log("Loading Sequelize ...");

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;

    console.log("Loading Sequelize model: " + file + " ...");
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    console.log("Associating ...");

    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("Loaded Sequelize");

module.exports = db;
