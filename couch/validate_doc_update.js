function (doc, old, user, security) {

    var validateCPI = require('validate');

    if (doc.type === 'cpi') {
        var valid = validateCPI(doc);

        if (!valid) {
            throw { forbidden: JSON.stringify(validate.errors, null, 2) };
        }
    }

}
