module.exports = function(grunt) {

  var connect = require('connect'),
    redirect = require('connect-redirection');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      pre: ['dist'],
      post: ['dist/temp'],
    },

    less:{
      app:{
        options: {
          paths: ['src/assets/less']
        },
        files : {
          'dist/temp/style.css': 'src/assets/less/style.less',
          'dist/temp/pdf.css': 'src/assets/less/pdf.less'
        }
      }
    },

    cssmin :{
      combine : {
        files : {
          'dist/assets/css/style.css':[
            'src/assets/js/components/highlight.js/styles/github.css',
            'dist/temp/style.css'
          ],
          'dist/assets/css/pdf.css':[
            'dist/temp/pdf.css'
          ]
        }
      }
    },

    concat:{
      dist : {
        src : [

          // Reveal.js
          'src/assets/js/components/headjs/dist/head.js',
          'src/assets/js/components/reveal.js/js/reveal.js',
          'src/assets/js/components/reveal.js/lib/js/classList.js',

          // Reveal.js Plugins
          'src/assets/js/components/reveal.js/plugin/markdown/marked.js',
          'src/assets/js/components/reveal.js/plugin/markdown/markdown.js',
          'src/assets/js/components/highlight.js/highlight.pack.js',
          'src/assets/js/components/reveal.js/plugin/zoom-js/zoom.js',

          //Presentation init
          'src/js/reveal.init.js'
        ],

        dest: 'dist/temp/app.js'
      }
    },

    uglify : {
      dist : {
        files: {
          'dist/assets/js/app.js' : ['dist/temp/app.js']
        }
      }
    },

    jade: {
      options : {
        pretty: true
      },
      index: {
        options: {
          data: {
            debug: true
          }
        },
        files: [
          {
            expand: true,
            cwd: 'src/views',
            src: ['**/*.jade'],
            dest: 'dist/',
            ext: '.html'
          }
        ]
      }
    },

    copy: {
      vendor : {
        files: [
          {
            expand: true,
            cwd: 'src/assets/js/components/reveal.js/lib/font',
            src:['**'],
            dest:'dist/assets/font'
          },
          {
            expand: true,
            cwd: 'src/assets/js/components/font-awesome/fonts',
            src:['**'],
            dest:'dist/assets/font'
          }
        ]
      },
      assets : {
        files: [
          {
            expand: true,
            cwd: 'src/assets/img',
            src:['**'],
            dest:'dist/assets/img'
          }
        ]
      },

    },

    watch : {
      options : {
        atBegin: true,
        livereload: 35729
      },
      src: {
        files: [
          'src/views/**/*',
          'src/assets/less/**/*',
          'src/assets/img/**/*'
        ],
        tasks: ['assemble']
      }
    },

    shell : {
      publish : {
        options: {
          stdout: true,
          stderr: true
        },
        command: 'cd ../; git subtree split --branch gh-pages --prefix slidedeck/dist/'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('connect', 'Start a custom static web server.', function() {
    grunt.log.writeln('Starting static web server in "dist" on port 8001.');

    connect()
      .use(redirect())
      .use(function(req, res, next) {
        if (req.url == '/') {
          res.redirect('/react-workshop');
        } else {
          next();
        }
      })
      .use('/react-workshop', connect.static('dist'))
      .listen(8001);
  });

  // Default task(s).
  grunt.registerTask('default', ['assemble']);
  grunt.registerTask('assemble', ['clean:pre', 'less', 'cssmin', 'concat', 'uglify', 'jade', 'copy', 'clean:post']);
  grunt.registerTask('run', ['connect', 'watch']);
  grunt.registerTask('publish', ['assemble', 'shell:publish']);



};
