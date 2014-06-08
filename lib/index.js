'use strict';

module.exports = function (options) {
    if (typeof options === 'undefined') {
        options = {};
    }
    
    var exposed = Object.create(null);
    
    
    function expose(id, func) {
        if (typeof id !== 'string') {
            throw new TypeError('id must be a string given: ' + id);
        }
        if (typeof func !== 'function') {
            throw new TypeError('func must be a function given: ' + func);
        }
        if (exposed[id]) {
            throw new Error('a function is already exposed with id: ' + id);
        }
        exposed[id] = func;
    }
    
    function query(id, params) {
        if (!exposed[id]) {
            throw new Error('no query has been registred with id: ' + id);
        }
        var func = exposed[id];
        var result, error;
        try {
            result = func.apply(undefined, params);
        } catch(e) {
            error = e;
        }
        
    }
    
    return {
        expose: expose,
        query: query
    };
};