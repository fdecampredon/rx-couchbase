'use strict';
/*jshint evil: true */

var assign  = require('./assign');
var collate = require('pouchdb-collate');

function ViewObserver(data, mapFunc, hasReduce, queryOptions) {
    this.data = data;
    this.mapFunc = new Function('doc', 'meta', 'emit','(' + mapFunc.toString() + ')(doc, meta)');
    this.hasReduce = hasReduce;
    this.queryOptions = queryOptions;
}
/*
 * ['descending', 'endkey', 'endkey_docid',
  'full_set', 'group', 'group_level', 'inclusive_end',
  'include_docs',
  'key', 'keys', 'limit', 'on_error', 'reduce', 'skip',
  'stale', 'startkey', 'startkey_docid'];
 */

assign(ViewObserver.prototype, {
    handleChange: function (change) {
        var emits = [];
        this.mapFunc(change.meta, change.doc, function (id, value) {
            emits.push({ id: id, value: value });
        });
        
        if (!emits.length) {
            return false;
        }
        
        var options = this.queryOptions;
        
        
//        var hasKeyInRange;
//        if (options.startkey) {
//            hasKeyInRange = emits.some(function (emit) {
//                return collate(emit.id, options.startkey) >= 0;
//            });
//            
//            if (!hasKeyInRange) {
//                return false;
//            }
//        }
//        
//        if (options.endkey) {
//            hasKeyInRange = emits.some(function (emit) {
//                return collate(emit.id, options.endkey) <= 0;
//            });
//            
//            if (!hasKeyInRange) {
//                return false;
//            }
//        }
        
        
        if (options.reduce && this.hasReduce) {
            //ask for a new version impossible to compute the result from 
            //change
        } else {
                
        }
    }
});



module.exports = ViewObserver;