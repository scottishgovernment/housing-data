#!/usr/bin/env node
'use strict';

/**
 * Housing Data entry point.
 *
 * Initialises and runs the service.
 */
const path = require('path');
const fs = require('fs');
const banner = fs.readFileSync(path.join(__dirname, 'banner.txt')).toString();

const configWeaver = require('config-weaver');
const config = configWeaver.config();
console.log('Started at', new Date().toString());
console.log(banner);
configWeaver.showVars(config, ' ' + config.application.name);
process.title = config.application.name;

var HousingDataService = require('./HousingDataService');
var app = new HousingDataService(config);
app.run();
