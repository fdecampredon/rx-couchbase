'use strict';

var QueryObservable = require('./query-observable');


module.exports = function () {
    var queryCallback;
    var disposeCallback;
    var observables = [];
        
    
    function setQueryCallback(cb) {
        queryCallback = cb;
    }
    
    function setDisposeCallback(cb) {
        disposeCallback = cb;
    }
    
    function handleChange(change) {
        observables.forEach(function (observable) {
            observable.handleChange(change);
        });
    }
    
    function query(id, params) {
        return new QueryObservable(id, params, subscribeObservable, disposeObservable);
    }
    
    function subscribeObservable(observable, queryId, changeId, params, callback) {
        queryCallback(queryId, changeId, params, function (err, descriptor, result) {
            if (err) {
                callback(err);
            }
            callback(descriptor, result);
            observables.push(observable);
        });
    }
    
    function disposeObservable() {
        var index = observables.indexOf(observables);
        if (index !== -1) {
            observables.splice(index);
        }
    }
    
    return {
        setQueryCallback: setQueryCallback,
        setDisposeCallback: setDisposeCallback,
        handleChange: handleChange,
        query: query
    };
};