module.exports = function(sequelize, DataTypes) {
  var Resume = sequelize.define('Resume', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    freezeTableName: true
  });

  return Resume;
};