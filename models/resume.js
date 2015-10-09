module.exports = function(sequelize, DataTypes) {
  var Resume = sequelize.define('Resume', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT
    },
    receiveAt: {
      type: DataTypes.DATE
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Resume.belongsTo(models.Employee, {
          as: "employee"
        });
      }
    }
  });

  return Resume;
};