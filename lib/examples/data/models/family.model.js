var $         = require('mf-utils-node'),
    enums     = require('../enums'),
    mongoose  = require('mongoose'),
    plugin    = require('../../../../src/to-dto.plugin.js');

var personSchema = require('./person.model');

var familySchema = new mongoose.Schema({

    _id : { type: String, name: 'ID', default: $.uuids.init, uuid: 'uid' },

    s   : { type: String, name: 'Sur Name', key: 'surname', required: true, trim: true },
    m   : [ personSchema ]
});
familySchema.plugin(plugin);

var model = mongoose.model('Family', familySchema);

module.exports = model;
