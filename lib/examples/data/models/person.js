/* jshint -W101 */
var $         = require('mf-utils-node'),
    enums     = require('../enums'),
    mongoose  = require('mongoose'),
    plugin    = require('../../../../src/to-dto.plugin.js'),
    rules     = $.constants.plugins.mf.dto.rules;

var hobbySchema = require('./_hobby');

var personSchema = new mongoose.Schema({

    _id : { type: String, name: 'ID', default: $.uuids.init, uuid: 'uid' },

    s   : { type: String, name: 'SSN', required: true, trim: true, minLength: 9, maxLength: 9, validChars: '0123456789', show: rules.GTE_ADMIN  },

    f   : { type: String, name: 'First Name', key: 'name.first', required: true, trim: true },
    m   : { type: String, name: 'Middle Name', key: 'name.middle', trim: true },
    l   : { type: String, name: 'Last Name', key: 'name.last', required: true, trim: true },

    bm  : { type: Number, name: 'Birth Month', key: 'dob.month', min: 1, max: 12 },
    bd  : { type: Number, name: 'Birth Day', key: 'dob.day', min: 1, max: 31 },
    by  : { type: Number, name: 'Birth Year', key: 'dob.year', min: 1900, max: 2016 },

    h   : { type: [ hobbySchema ], name: 'Hobbies' }
});
personSchema.plugin(plugin);

var model = mongoose.model('Person', personSchema);

module.exports = model;
