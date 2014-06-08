'use strict';

var Rx                  = require('rx');
var assign              = require('utils/assign');
var KeysQueryObservable = require('./keysQueryObservable');

function Client(endPoint) {
    
}

function retrieveQueryData(client, observable, changeId, callback) {
        
}

Client.prototype.get = function(queryId) {
    return new KeysQueryObservable(
        queryId,
        retrieveQueryData.bind(undefined, this),
        dispose
    );
};



module.exports = Client;
