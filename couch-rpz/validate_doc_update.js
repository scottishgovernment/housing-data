function (doc, old, user, security) {

    var validate = require('validate');
    var valid = validate(doc);

    if (!valid) {
        throw { forbidden: JSON.stringify(validate.errors, null, 2) };
    }

}
