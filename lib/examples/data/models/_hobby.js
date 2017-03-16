var $         = require('mf-utils-node'),
    enums     = require('../enums'),
    mongoose  = require('mongoose'),
    plugin    = require('../../../../src/to-dto.plugin.js');

var hobbySchema = new mongoose.Schema({

    _id : { type: String, name: 'ID', default: $.uuids.init, uuid: 'uid' },

    n   : { type: String, name: 'Name', required: true, trim: true }
});
hobbySchema.plugin(plugin);

module.exports = hobbySchema;
