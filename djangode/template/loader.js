/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var util = require('util');
var fs = require('fs');
var path = require('path');
var template_system = require('./template');

var cache = {};
var cacheMode = true;
var template_path = '/tmp';


// TODO: get_template
    // should support subdirectories

function add_to_cache(name, callback) {
    fs.readFile(path.join(template_path, name), function (error, s) {
        if (error) {
            return callback(error);
        }
        cache[name] = {
            tpl: template_system.parse(s),
            time: new Date()
        };
        callback(false, cache[name].tpl);
    });
}

var load = exports.load = function (name, callback) {
    if (!callback) { throw 'loader.load() must be called with a callback'; }

    if (cacheMode && cache[name] != undefined) {
        fs.stat(path.join(template_path, name), function (error, stats) {
            if (error) {
                return callback(error);
            }
            if (cache[name].time > stats.mtime) {
                callback(false, cache[name].tpl);
            } else {
                add_to_cache(name, callback);
            }
        });
    } else {
        add_to_cache(name, callback);
    }
};

exports.load_and_render = function (name, context, callback) {
    load(name, function (error, template) {
        if (error) {
            callback(error);
        } else {
            template.render(context, callback);
        }
    });
};

exports.disableCache = function () {
    cacheMode = false;
};

exports.flush = function () {
    cache = {};
};

exports.set_path = function (path) {
    template_path = path;
};
