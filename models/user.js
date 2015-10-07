module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Comment, {
          foreignKey: "userId"
        });
      }
    }
  });

  return User;
};