module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT
    },
    like: {
      type: DataTypes.BOOLEAN
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Comment.belongsTo(models.Employee, {
          foreignKey: "employeeId"
        });

        Comment.belongsTo(models.User, {
          foreignKey: "userId"
        });
      }
    }
  });

  return Comment;
};