var $           = require('mf-utils-node'),
    mongoose    = require('mongoose');

module.exports = function (schema, options) {

    options = options || {};
    options.defaults = options.defaults || {};

    var defaults = {
        hide    : $.strings.unique(options.hide || ['__v', '__t']),
        show    : $.strings.unique(options.show),
        level   : (typeof options.defaults.level !== 'undefined') ? parseInt(options.level) : undefined,
    };

    schema.set('toJSON', {
        transform: function (doc, ret, options) {

            var params = {
                hide    : $.strings.unique(options.hide || defaults.hide),
                show    : $.strings.unique(options.show || defaults.show),
                levels  : options.levels || $.constants.plugins.mf.dto.levels
            };

            if (options && options.level) {
                if ($.numbers.isNumber(options.level.value)) {
                    params.level = parseInt(options.level.value);
                } else if ($.numbers.isNumber(options.level)) {
                    params.level = parseInt(options.level);
                }
            }

            var obj = {};
            Object.keys(schema.paths).forEach(function(pathName){

                var key     = $.schemas.getKey(schema, pathName);

                var hideOpr = $.schemas.getOperation(schema, pathName, 'hide');
                var doHide = (params.hide.length > 0 || ($.numbers.isNumber(params.level) && !!hideOpr));
                var isHide = isMatch(pathName, params.hide, params.level, hideOpr);

                var showOpr = $.schemas.getOperation(schema, pathName, 'show');
                var doShow = (params.show.length > 0 || ($.numbers.isNumber(params.level) && !!showOpr));
                var isShow = isMatch(pathName, params.show, params.level, showOpr);

                var hide;
                if (doShow && doHide) {
                    hide = (isHide || !isShow);
                } else if (doHide) {
                    hide = isHide;
                } else if (doShow) {
                    hide = !isShow;
                }

                if (typeof hide === 'undefined' || hide === false) {
                    $.objects.setValue(obj, key, ret[pathName]);
                }
            });

            return JSON.stringify(obj);
        }
    });

    function fromJsonSync (json){
        var obj = {};
        json = (typeof json === 'string') ? JSON.parse(json) : json;
        schema.eachPath(function(pathName, schemaType){

            var field   = schema.paths[pathName];
            var options = (field && field.options) ? field.options : {};
            var methods = (schemaType.schema && schemaType.schema.methods) ? schemaType.schema.methods : {};

            var key     = $.schemas.getKey(schema, pathName);
            var value   = (key.indexOf('.') < 0) ? json[key] : $.objects.getValueFromPath(json, key);

            if (!(value instanceof Array) || !field.schema || !methods.fromJSONSync) {
                obj[pathName] = value;
            } else {
                obj[pathName] = [];
                value.forEach(function(v){
                    var child = methods.fromJSONSync(v);
                    obj[pathName].push(child);
                });
            }
        });

        return obj;
    }

    schema.methods['fromJSONSync'] = fromJsonSync;
    schema.methods['fromJSON'] = function (json, cb) {
        var obj;
        var err;
        try {
            obj = fromJsonSync(json);
        } catch (e) {
            err = e;
        }
        return cb(err, obj);
    };

};

function isMatch(fieldName, explicitFields, currentLevel, operation) {

    var match = explicitFields.find(function(field){
        return (field === fieldName);
    });
    if (match) { return true; }

    if (!operation || !$.numbers.isNumber(currentLevel)) { return false; }
    if (!$.numbers.isNumber(operation.left) && !$.numbers.isNumber(operation.right)) { return false; }

    switch (operation.operation) {
        case '===':
            return (currentLevel === operation.right);
        case '<':
            return (currentLevel < operation.right);
        case '>':
            return (currentLevel > operation.right);
        case '<=':
            return (currentLevel <= operation.right);
        case '>=':
            return (currentLevel >= operation.right);
        default:
            return false;
    }

    return false;
}
