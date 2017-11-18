'use strict';

const mysql = require("mysql"),
    config = require("../../config/config.js");

var pool = mysql.createPool(config.databaseLogin);

var connection = {};

connection.query = function(sql, variables, callback) {

    if (typeof variables === 'function') {
        callback = variables;
        variables = [];
    }

    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('db error', err);
            callback(err, null);
            return;
        }
        connection.query(sql, variables, function(err, results) {
            connection.release();
            callback(err, results);
        });
    });
}

exports.connection = connection;