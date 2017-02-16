module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
	uglify: {
	  options: {
	    mangle: true
	  },
	  my_target: {
	    files: {
	      'dist/networksim.min.js': ['js/**/*.js']
	    }
	  }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);

};
