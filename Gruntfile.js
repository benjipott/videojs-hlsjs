'use strict';

var basename = require('path').basename;

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
    ' Licensed <%= pkg.license %> */\n',
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['node_modules/hls.js/dist/hls.js', 'lib/**/*.js', '!lib/**/closure.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    closure: {
      options: {
        closure: 'lib/closure.js'
      },
      wrap: {
        files: [
          {
            src: ['dist/<%= pkg.name %>.js']
          }
        ]
      }
    },
    qunit: {
      files: 'test/**/*.html'
    },
    jshint: {
      gruntfile: {
        options: {
          node: true
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['lib/**/*.js']
      },
      //test: {
      //  options: {
      //    jshintrc: '.jshintrc'
      //  },
      //  src: ['test/**/*.js']
      //}
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default',
    ['clean',
      'jshint',
      'test',
      'build'
    ]);

  grunt.registerTask('build',
    ['concat',
      'uglify',
      'closure']);

  grunt.registerTask('test', function () {
    grunt.task.run(['manifests-to-js', 'qunit']);
  });


  grunt.registerTask('manifests-to-js', 'Wrap the test fixtures and output' +
    ' so they can be loaded in a browser',
    function () {
      var
        jsManifests = 'window.manifests = {\n',
        jsExpected = 'window.expected = {\n';
      grunt.file.recurse('test/manifest/',
        function (abspath, root, sub, filename) {
          if ((/\.m3u8$/).test(abspath)) {

            // translate this manifest
            jsManifests += '  \'' + basename(filename, '.m3u8') + '\': ' +
              grunt.file.read(abspath)
                .split(/\r\n|\n/)

                // quote and concatenate
                .map(function (line) {
                  return '    \'' + line + '\\n\' +\n';
                }).join('')

                // strip leading spaces and the trailing '+'
                .slice(4, -3);
            jsManifests += ',\n';
          }

          if ((/\.js$/).test(abspath)) {

            // append the expected parse
            jsExpected += '  "' + basename(filename, '.js') + '": ' +
              grunt.file.read(abspath) + ',\n';
          }
        });

      // clean up and close the objects
      jsManifests = jsManifests.slice(0, -2);
      jsManifests += '\n};\n';
      jsExpected = jsExpected.slice(0, -2);
      jsExpected += '\n};\n';

      // write out the manifests
      grunt.file.write('tmp/manifests.js', jsManifests);
      grunt.file.write('tmp/expected.js', jsExpected);
    });

  grunt.registerMultiTask('closure', 'Add closure around the app', function () {


    // Set up defaults for the options hash
    var options = this.options({
      closure: ''
    });

    // Iterate over the list of files and add the banner or footer
    this.files.forEach(function (file) {
      file.src.forEach(function (src) {
        if (grunt.file.isFile(src)) {
          // wrap the original app source with the closure
          grunt.file.write(src,
            grunt.file.read(options.closure)
              .replace(/\/\*#replaceCode#\*\//, grunt.file.read(src))
          );
          grunt.verbose.writeln('Closure added to file ' + src.cyan);
        }

      });
    });

  });
};
