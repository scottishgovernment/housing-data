#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

// Generate schema validation code from the schema
const Ajv = require('ajv');
const standaloneCode = require('ajv/dist/standalone').default;
var ajv = new Ajv({
    allErrors: true,
    code: {
        source: true
    }
});
var dir = path.join(__dirname, 'couch');
var json = fs.readFileSync(path.join(dir, 'cpi.json'));
var schema = JSON.parse(json);
var validate = ajv.compile(schema);
var moduleCode = standaloneCode(ajv, validate);
fs.writeFileSync(path.join(dir, 'validate.js'), moduleCode.toString());
