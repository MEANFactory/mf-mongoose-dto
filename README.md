# mf-mongoose-dto
Convert to/from JSON DTO while applying optional level-based hiding.

## Installation ##

    npm install --save mf-mongoose-dto

## Features ##

### Conversion ###
- Convert mongoose docs to/from JSON-based data transfer objects
- Conserve database space by using shorthand field names
- Define dot notation for database fields on schema during output
- Override field names with dot notation at any level

### Hiding / Showing Fields (during conversion) ###
- Hide fields based on current user level or permissions
- Rules defined on schema, as plugin defaults, or with each call
- Override showing or hiding of fields at runtime
- Use explicit field names or user level / permissions







## Settings ##

### Extended Schema Parameters ###
These attributes may be added to the fields on your schema for additional functionality:

| Parameter  | Type      | Explanation      |
|------------|-----------|------------------|
|`name`      | String    | Cosmetic name used in error messages |
|`key`       | String    | Dot notated path to use when building JSON object (ie `'dob.month'`)  |
|`show`      | Number or Operation | Level condition used to show the field (ie `0` or `'< 30'`) |
|`hide`      | Number or Operation | Level condition used to hide the field (ie `100` or `'>= 100'`) |

**Note:**  
The `name:` will be converted to camelCase and used for a key name, during the `toJSON()` call, if no `key:` value is supplied.

### toJSON() Options ###
The following options may be supplied to the `toJSON()` call in the form of a JSON object:

| Parameter  | Type      | Explanation      |
|------------|-----------|------------------|
|`hide`      | String or String Array    | Name or list of names of fields to always **hide** |
|`show`      | String or String Array    | Name or list of names of fields to always **show** |
|`level`     | Number    | Level of the request, or requesting user, requiring the item.  |








## Example #1: Expanded Field Names ##
The [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin will hydrate the resulting JSON object with using camel case names for all attributes.  If desired, complex object graphs may be created during the call.

### Logic ###
1. `key`: a dot-notated path will be constructed;
2. `name`: the plain-English name (used by [mf-mongoose-validate](https://github.com/MEANFactory/mf-mongoose-validate)) will be converted and used;
3. the field name is used if neither `key` or `name` exist on the schema; and,
4. enumerators are always hydrated using an `id` field with an object.

### Schema ###
```
var mongoose = require('mongoose'),
    mfDto   = require('mf-mongoose-dto'),
	enums    = require('../enums');

var personSchema = mongoose.Schema({

    s   : { type: String, name: 'SSN'  },

    p   : { type: String, name: 'Prefix', enums: enums.NamePrefix.ids },
    f   : { type: String, name: 'First Name', key: 'name.first' },
    m   : { type: String, name: 'Middle Name', key: 'name.middle' },
    l   : { type: String, name: 'Last Name', key: 'name.last' },

    bm  : { type: Number, name: 'Birth Month', key: 'dob.month' },
    bd  : { type: Number, name: 'Birth Day', key: 'dob.day' },
    by  : { type: Number, name: 'Birth Year', key: 'dob.year' }
});

personSchema.plugin(mfDto);

module.exports = mongoose.model('Person', personSchema);
```

### Usage: ###
```
var result = person.toJSON();
```
### Result: ###

```
{
    ssn : '123-45-6789',
    prefix : {
        id : 'MR'
    },
    name : {
        first : 'Joe',
        last  : 'Blow'
    },
    dob  : {
        month : 12,
        day   : 31,
        year  : 2000
    }
}
```


## Example #2: Dynamically Hiding Fields ##
The [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin will hide fields based field names and/or parameters on the schema.  This allows for runtime levels (possibly for membership levels or role levels) to be used at runtime to dynamically hide or show fields in the resulting data transfer object.

### Logic ###
1. default options, supplied to the plugin, are used if not supplied during `toJSON()`;
1. field may be explicitly shown or hidden by supplying the name of the field(s);
1. `level` statements and options are used to determine when to show or hide fields

### Schema ###
```
var mongoose = require('mongoose'),
    mfDto   = require('mf-mongoose-dto'),
	enums    = require('../enums');

var GUEST = 10,
    USER  = 20,
	OWNER = 30,
	ADMIN = 40;

var personSchema = mongoose.Schema({

    s   : { type: String, name: 'SSN', hide: '< 30' },

    p   : { type: String, enums: enums.NamePrefix.ids },
    f   : { type: String, name: 'First Name' },
    m   : { type: String, name: 'Middle Name', show: '>= 20' },
    l   : { type: String, name: 'Last Name', show: 30 },

    bm  : { type: Number, name: 'Birth Month' },
    bd  : { type: Number, name: 'Birth Day', hide: true },
    by  : { type: Number, name: 'Birth Year', hide: '< 40' }
});

personSchema.plugin(mfDto, { hide: ['__t', '__v'] });

module.exports = mongoose.model('Person', personSchema);
```

### Usage: ###
```
var result = person.toJSON({
    hide  : '_id',
    show  : ['bd', 'by'],
    level : USER
});
```
### Result: ###

```
{
    prefix : {
        id : 'MR'
    },
    firstName  : 'Joe',
    middleName : 'Dweezil'
    birthMonth : 12,
    birthDay   : 31,
    birthYear  : 2000
}
```
### Explanation: ###
1. Default `hide` field names were supplied to the plugin when it was initialized.  Had the document contained either `__v` or `__t` fields they would have been hidden.
1. Since no `key` properties were supplied, the `name` properties were converted to a simple attribute name instead of the complex object in the previous example;
1. The `_id` field was explicitly hidden during the `toJSON()` call;
1. The `bd` and `by` fields _would_ have been hidden because of the `hide` attribute on the schema (one was `true` and the other would have evaluated), however these fields were explicitly shown during the `toJSON()` call;
1. The `l` (lastName) field was hidden because the current user `level` (supplied in the `toJSON()` call) does not match the strict `show: 30` value on the schema (which means to only show if the level matches exactly); and,
1. Prefix is an enumerator and is always shown as and object with `id`.

## Notes ##

### DTO Levels (ACL) ###
The default levels used by the `toJSON()` operations for `hide` and `show` field attributes are taken from `.constants` object within the ['mf-utils-node'](https://github.com/MEANFactory/mf-utils-node) project.  They are:

    $.constants.plugins.mf.dto.levels

| Key | Value |
|-----|-------|
| `NONE` | `0` |
| `GUEST` | `10` |
| `USER` | `20` |
| `ADMIN` | `30` |
| `OWNER` | `40` |
| `SYSTEM` | `50` |

The `.constants` object also contains a `.rules` property and contains convenience properties for each of the operations:

    $.constants.plugins.mf.dto.rules

| Operation | Property Prefix | Alternate Prefix |
|---|---|---|
| `>` | `GREATER_THAN_` | `GT_` |
| `<` | `LESS_THAN_` | `LT_` |
| `>=` | `GREATER_THAN_OR_EQUALS_` | `GTE_` |
| `<=` | `LESS_THAN_OR_EQUALS_` | `LTE_` |
| `==` | `EQUALS_` | `EQ_` |

This allows rules to be specified as follows:

```
var $     = ('mf-utils-node');
var rules = $.constants.plugins.mf.dto.rules;

var testSchema = mongoose.Schema({
    ssn       : { type: String, hide: rules.LESS_THAN_ADMIN },
    birthDate : { type: Date,   hide: rules.LT_ADMIN },
    firstName : { type: String, show: rules.GREATER_THAN_NONE },
    lastName  : { type: String, show: rules.GT_NONE },
});
```


## Related Projects
The following projects have been designed specifically to work with each other:

**[mf-mongoose-audittrail](https://github.com/MEANFactory/mf-mongoose-audittrail)**  
Track who and when documents are created and updated without complex programming.  Compare and contract different versions of each document.

**[mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) (this plugin)**  
Convert to/from JSON DTO while applying optional level-based hiding.

**[mf-mongoose-softdelete](https://github.com/MEANFactory/mf-mongoose-softdelete)**  
Increase data integrity by retaining historical data and preventing data from being permanently deleted.  Each `delete` operation causes the document to be marked as "deleted" and subsequently hidden from result sets.

**[mf-mongoose-validate](https://github.com/MEANFactory/mf-mongoose-validate)**  
Provides additional validation for extended data types, field lengths, arrays, and other useful features.

And, for convenience...

**[mf-mongoose-plugins](https://github.com/MEANFactory/mf-mongoose-plugins)**  
Helper project to instantiate any of the installed `mf-mongoose` plugins.


## Contact Information
MEAN Factory  
[support@meanfactory.com](mailto:support@meanfactory.com)  
[www.MEANFactory.com](http://www.MEANFactory.com)  
