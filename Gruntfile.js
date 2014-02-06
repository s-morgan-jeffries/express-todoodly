'use strict';

var request = require('request');
var _ = require('lodash');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

//  var runShellCommand = function(commandName, command, options) {
//    options = options || {
//      stdout: true
//    };
//    grunt.config.data.shell[commandName] = {
//      options: options,
//      command: command
//    };
//    grunt.task.run('shell:' + commandName);
//  };

  grunt.initConfig({

//    bower: {
//      heroku: {
//        options: {
//          targetDir: './heroku/public/components',
////          layout: 'byType',
//          layout: 'byComponent',
//          install: true,
//          verbose: true,
//          cleanTargetDir: false,
//          cleanBowerDir: false,
//          bowerOptions: {
////            production: true
//          }
//        }
//      }
//    },

    clean: {
      heroku: {
        files: [{
          dot: true,
          src: [
            'heroku/*',
            '!heroku/.git*',
            '!heroku/Procfile',
            '!heroku/.env',
            '!heroku/.bowerrc'
          ]
        }]
      }
    },

    copy: {
      heroku: {
        files: [
          {
            expand: true,
            cwd: '.',
            dest: 'heroku',
            src: [
              'server.js',
              'app/**/*',
              'config/**/*',
              'lib/**/*',
              'package.json',
              'bower.json'
            ]
          },
          {
            expand: true,
            cwd: 'public',
            dest: 'heroku/public',
            src: [
              'img/**/*',
              'js/**/*',
              'css/*.css'
            ]
          }
//          {
//            expand: true,
//            dot: true,
//            cwd: '<%= yeoman.devPublic %>',
//            dest: '<%= yeoman.tempPublic %>',
//            src: [
//              '*.{ico,png,txt}',
//              '.htaccess',
//              'bower_components/**/*',
//              'images/{,*/}*.{gif,webp}',
//              'fonts/*'
//            ]
//          }
        ]
      }
    },

    develop: {
      server: {
        file: 'server.js'
      }
    },

    // Grunt env: This loads environment variables to simulate different environments.
    env: {
      dev: {
        src: '.dev_env'
      },
      heroku: {
        src: 'heroku/.env'
      }
    },

    jasmineNode: {
      options: {
        // Available options:
        // specFolders: Array of strings, will be searched for specs. Default: []
        // projectRoot: String, will be appended to specFolders. Default: '.'
        // source: String. Default: "src"
        // specNameMatcher: String. Default: "spec"
        // extensions: String. Default: "js"
        // match: String. Default: "."
        // teamcity: Boolean. Default: false
        // useRequireJs: Boolean. Default: false
        // matchall: Boolean. Default: false
        // autotest: Boolean. Default: false
        // useHelpers: Boolean. Default: false
        // forceExit: Boolean. Default: false
        // useCoffee: Boolean. Default: false
        // isVerbose: Boolean. Default: true
        // showColors: Boolean. Default: true
        specNameMatcher: "Spec", // load only specs containing specNameMatcher
//      specFolders: ['./test/spec'],
//        projectRoot: './test/spec',
        verbose: false,
        requirejs: false,
//        forceExit: true,
        jUnit: {
          report: true,
          savePath : "./test/reports/",
          useDotNotation: true,
          consolidate: true
        }
      },
      controllers: {
        options: {
          projectRoot: './test/spec/controllers'
        }
      },
      models: {
        options: {
          projectRoot: './test/spec/models'
        }
      }
    },

// This opens up the app in the browser
    open: {
      server: {
        url: 'http://localhost:' + (process.env.PORT || 3000)
      }
    },

    pkg: grunt.file.readJSON('package.json'),

// Sass (duh)
    sass: {
      build: {
        options: {
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'public/css',
          src: ['*.scss'],
          dest: 'public/css',
          ext: '.css'
        }]
      },
      devServe: {
        options: {
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'public/css',
          src: ['*.scss'],
          dest: 'public/css',
          ext: '.css'
        }]
      }
    },

// Configure the watch task
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'server.js',
          'app/**/*.js',
          '!app/views/**/*',
          'config/**/*.js',
          'lib/**/*.js'
        ],
//        tasks: ['develop', 'delayed-livereload'],
        tasks: ['develop', 'pause:5000'],
//        tasks: ['express:dev'],
        options: {
          livereload: true,
          interrupt: true,
          spawn: false //Without this option specified express won't be reloaded,
        }
      },
      public: {
        files: [
          'public/**/*',
          '!public/**/*.{scss,sass}'
        ],
        options: {
          livereload: reloadPort
        }
      },
      views: {
        files: ['app/views/**/*'],
        options: {
          livereload: reloadPort
        }
      },
      sass: {
        files: ['public/css/**/*.{scss,sass}'],
        tasks: ['sass:devServe']
      }
//      js: {
//        files: ['public/js/*.js'],
//        options: {
//          livereload: reloadPort
//        }
//      },
//      css: {
//        files: ['public/css/*.css'],
//        options: {
//          livereload: reloadPort
//        }
//      },
//      jade: {
//        files: ['views/*.jade'],
//        options: {
//          livereload: reloadPort
//        }
//      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('bower', function(target) {
    var taskConfig = {
      heroku: {
        command: 'bower install --production',
        options: {
          stdout: true,
          execOptions: {
            cwd: 'heroku'
          }
        }
      }
    };
    if (target in taskConfig) {
      grunt.config.data.shell = grunt.config.data.shell || {};
      grunt.config.data.shell.bower = taskConfig[target];
      grunt.task.run('shell:bower');
    }
  });

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
        var reloaded = !err && res.statusCode === 200;
        if (reloaded) {
          grunt.log.ok('Delayed live reload successful.');
        } else {
          grunt.log.error('Unable to make a delayed live reload.');
        }
        done(reloaded);
      });
    }, 1500);
  });

  grunt.registerTask('pause', function(duration) {
    duration = duration || 1000;
    var done = this.async();

    setTimeout(function() {
      done();
    }, duration);
  });

  grunt.registerTask('server', function(target) {
    var targetTask;
    if (target && target === 'heroku') {
      targetTask = [
        'env:heroku'
      ];
    } else {
      targetTask = [
        'env:dev',
        'develop',
        'pause:2500',
        'open',
        'watch'
      ];
    }
    grunt.task.run(targetTask);
  });

  grunt.registerTask('heroku', [
    'clean:heroku',
    'sass:build',
    'copy:heroku',
    'bower:heroku'
  ]);

  // This just delegates to the jasmine_node task. For future reference, this is how you should set up testing on the
  // back-end. Note that this depends on the jasmine-node and grunt-jasmine-node packages, and you should look at the
  // source code for those if you want to understand what's going on.
  grunt.registerMultiTask('jasmineNode', function(target) {
    var jasmineNodeConfig = this.options();

    grunt.config.data.jasmine_node = jasmineNodeConfig;
    grunt.task.run('jasmine_node');
  });

  grunt.registerTask('default', ['server']);
};
