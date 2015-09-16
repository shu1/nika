module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    date: grunt.template.today("yy_mm_dd_h_MM_ss"),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'js/**/*.js',
        dest: 'builds/Build@<%= date %>/<%= pkg.name %>.min.js'
      }
    },
    processhtml: {
	    options: {
	      data: {
	        message: 'Hello world!'
	      }
	    },
	    dist: {
	      files: {
	        'builds/Build@<%= date %>/index.html': ['index.html']
	      }
	    }
	  },
	  copy: {
		  main: {
		    files: [
		      {expand: true, src: ['images/**'], dest: 'builds/Build@<%= date %>/'},
		      {expand: true, src: ['audio/**'], dest: 'builds/Build@<%= date %>/'}
		    ],
		  },
		}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['uglify','processhtml','copy']);

};