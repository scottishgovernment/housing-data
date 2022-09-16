'use strict';

var fs = require('fs');
var path = require('path');

// Generate schema validation code from the schema
function generateSchemaValidator() {
    const Ajv = require('ajv');
    const standaloneCode = require("ajv/dist/standalone").default
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
    var moduleCode = standaloneCode(ajv, validate)
    fs.writeFileSync(path.join(dir, 'validate.js'), moduleCode.toString());

    dir = path.join(__dirname, 'couch-rpz');
    json = fs.readFileSync(path.join(dir, 'rpz.json'));
    schema = JSON.parse(json);
    validate = ajv.compile(schema);
    var moduleCode = standaloneCode(ajv, validate)
    fs.writeFileSync(path.join(dir, 'validate.js'), moduleCode.toString());
}

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');
    require('load-grunt-config')(grunt, {
        init: true,
        loadGruntTasks: false
    });

    grunt.task.registerTask(
        'validator',
        'Generates a validator for the CouchDB schema',
        generateSchemaValidator);

    var tokenFile = path.join(process.env.HOME, '.sonar/token');
    var token;
    if (fs.existsSync(tokenFile)) {
        token = fs.readFileSync(tokenFile).toString().trim();
    }

    var createSonarConfiguration = function(mode) {
        var options = {
            sonar: {
                analysis: {
                    mode: mode
                },
                host: {
                    url: 'http://sonar.digital.gov.uk'
                },
                projectKey: pkg.name,
                projectName: "Housing Data",
                projectVersion: pkg.version,
                projectDescription: pkg.description,
                sources: 'src',
                language: 'js',
                sourceEncoding: 'UTF-8',
                javascript: {
                    lcov: {
                        reportPaths: 'target/coverage/lcov.info'
                    }
                },
                exclusions: [
                  'src/AmILiveCheck.js',
                  'src/ElasticsearchLogger.js'
                ],
                working: {
                  directory: "target/sonar"
                }
            }
        };
        if (token) {
          options.sonar.login = token;
        }
        return options;
    };

    grunt.initConfig({

        shell: {
            options: {
                stdout: true
            },
            nyc: {
                command: "nyc jasmine-node --junitreport --output target/reports test",
                execOptions: {
                    env: "PATH=node_modules/.bin"
                }
            }
        },

        sonarRunner: {
            analysis: {
                options: createSonarConfiguration('publish')
            },
            preview: {
                options: createSonarConfiguration('preview')
            }
        }

    });

    require('jit-grunt')(grunt, {});

};
