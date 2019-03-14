'use strict';

var fs = require('fs');
var path = require('path');

// Generate schema validation code from the schema
function generateSchemaValidator() {
  var Ajv = require('ajv');
  var pack = require('ajv-pack');
  var ajv = new Ajv({
    allErrors: true,
    sourceCode: true
  });

  var dir = path.join(__dirname, 'couch');
  var json = fs.readFileSync(path.join(dir, 'cpi.json'));
  var schema = JSON.parse(json);
  var validate = ajv.compile(schema);
  var moduleCode = pack(ajv, validate);
  fs.writeFileSync(path.join(dir, 'validate.js'), moduleCode.toString());

  dir = path.join(__dirname, 'couch-rpz');
  json = fs.readFileSync(path.join(dir, 'rpz.json'));
  schema = JSON.parse(json);
  validate = ajv.compile(schema);
  moduleCode = pack(ajv, validate);
  fs.writeFileSync(path.join(dir, 'validate.js'), moduleCode.toString());
}

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');
    require('load-grunt-config')(grunt);
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-sonar-runner');
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
                }
            }
        };
        if (token) {
          options.sonar.login = token;
        }
        return options;
    };

    grunt.initConfig({

        copy: {
            couchdb: {
              files: [
                {
                  expand: true,
                  cwd: "node_modules",
                  src: [
                    "ajv/lib/compile/formats.js",
                    "ajv/lib/compile/util.js",
                    "ajv/lib/compile/ucs2length.js"
                  ],
                  dest: "couch"
                },
                {
                  expand: true,
                  cwd: "node_modules",
                  src: "fast-deep-equal/index.js",
                  dest: "couch",
                  rename: function(dest, src) {
                    return dest + "/fast-deep-equal.js";
                  }
                },
                {
                  expand: true,
                  cwd: "node_modules",
                  src: [
                    "ajv/lib/compile/formats.js",
                    "ajv/lib/compile/util.js",
                    "ajv/lib/compile/ucs2length.js"
                  ],
                  dest: "couch-rpz"
                },
                {
                  expand: true,
                  cwd: "node_modules",
                  src: "fast-deep-equal/index.js",
                  dest: "couch-rpz",
                  rename: function(dest, src) {
                    return dest + "/fast-deep-equal.js";
                  }
                }
              ]
            },
            test: {
                files: [
                    {
                        expand: true,
                        src: ['src/*.txt'],
                        dest: 'target/src/'
                    }
                ],
            },
        },

        instrument: {
            files: [
                'src/**/*.js',
            ],
            options: {
                lazy: true,
                basePath: 'target/'
            }
        },

        jasmine_node: {
            test: {
                all: ['test'],
                src: '*.js',
                verbose: true,
                options: {
                    specs: 'test/*_spec.js',
                    helpers: 'test/*_helper.js',
                    forceExit: true,
                    extensions: 'js',
                    specNameMatcher: 'spec',
                    jUnit: {
                        report: false,
                        savePath: "target/reports/",
                        useDotNotation: true,
                        consolidate: true
                    }
                }
            }
        },

        storeCoverage: {
            options: {
                dir: 'target/coverage'
            }
        },

        makeReport: {
            src: 'target/coverage/*.json',
            options: {
                type: 'lcov',
                dir: 'target/coverage',
                print: 'detail'
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

};
