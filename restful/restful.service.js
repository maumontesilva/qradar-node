/**
 * Created by maurosil on 24/03/2016.
 */

var express = require('express');
var request = require('request');
var Log = require('log');
var logger = new Log('info');

var url;
var username;
var password;

var RestfulService = function(protocol, server, port, user, pass) {
  if(!server) {
      logger.error('server name is not defined.');
      throw 'server name is not defined.';
  }

  url = (protocol || 'https') + '://' + server + ':' + (port || '443') + '/';

  if(username && password) {
      username = user;
      password = pass;
  }
};

RestfulService.prototype.sendRequest = function(method, endpoint, stringQuery, body, headers, callback) {
    var queryConfiguration = {
        method: method || 'GET',
        rejectUnauthorized: false //FOR NOW DO NOT CONSIDER CERT
    };

    queryConfiguration.url = url;

    if(endpoint) {
        queryConfiguration.url = queryConfiguration.url + endpoint;
    }

    if(stringQuery) {
        queryConfiguration.url = queryConfiguration.url + '?' + stringQuery;
    }

    if(body) {
        queryConfiguration.body = JSON.stringify(body);
    }

    if(headers && Object.keys(headers).length > 0) {
        queryConfiguration.headers = headers;
    }
    if(username && password) {
        var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        if(queryConfiguration.headers) {
            queryConfiguration.headers.Authorization = auth;
        } else {
            queryConfiguration.headers = {Authorization : auth};
        }
    }
    logger.debug('connection configuration: ', queryConfiguration);
    xforceRequest(queryConfiguration, callback);
};

module.exports = RestfulService;

function xforceRequest(queryConfiguration, cb) {
    request(queryConfiguration, function(err, res, result) {
        if(err) {
            logger.error('Connection failed due to ', err);
            return cb(err, null);
        }

        return cb(err, JSON.parse(result) );
    });
}