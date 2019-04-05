'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "groups", deps: []
 * createTable "notifications", deps: []
 * createTable "users", deps: []
 * createTable "measures", deps: [groups]
 *
 **/

var info = {
    "revision": 1,
    "name": "init",
    "created": "2019-04-04T22:30:29.354Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "groups",
            {
                "grpid": {
                    "type": Sequelize.STRING,
                    "field": "grpid",
                    "primaryKey": true,
                    "allowNull": false
                },
                "category": {
                    "type": Sequelize.STRING,
                    "field": "category"
                },
                "date": {
                    "type": Sequelize.STRING,
                    "field": "date"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "notifications",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "data": {
                    "type": Sequelize.TEXT,
                    "field": "data"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "users",
            {
                "patientID": {
                    "type": Sequelize.STRING,
                    "field": "patientID",
                    "primaryKey": true
                },
                "nokiaID": {
                    "type": Sequelize.INTEGER,
                    "field": "nokiaID",
                    "primaryKey": false
                },
                "token": {
                    "type": Sequelize.STRING,
                    "field": "token"
                },
                "secret": {
                    "type": Sequelize.STRING,
                    "field": "secret"
                },
                "refresh": {
                    "type": Sequelize.STRING,
                    "field": "refresh"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "measures",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "value": {
                    "type": Sequelize.STRING,
                    "field": "value"
                },
                "type": {
                    "type": Sequelize.STRING,
                    "field": "type"
                },
                "multiplier": {
                    "type": Sequelize.STRING,
                    "field": "multiplier"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "groupGrpid": {
                    "type": Sequelize.STRING,
                    "field": "groupGrpid",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "groups",
                        "key": "grpid"
                    },
                    "allowNull": false
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
