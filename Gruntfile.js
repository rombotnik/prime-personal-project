module.exports = function(grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Uglify plugin code
        uglify: {
            options: {
                // Adds a comment line to the top of build files w/ name and date
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n'
            },
            build: {
                // Tells uglify where to get source code and where to build destination code (client only)
                src: 'client/assets/scripts/app.js',
                dest: 'public/assets/scripts/app.min.js'
            }
        },
        // Copy plugin code
        copy: {
            vendor: {
                // Gets the angular JS library and copies it over to the client build
                expand: true,
                // CWD == current working directory, so where we get files from
                cwd: "node_modules/",
                src: [
                    "angular/angular.min.js",
                    "angular/angular.min.js.map",
                    "bootstrap/dist/css/bootstrap.min.css",
                    "bootstrap/dist/fonts/*"
                ],
                dest: "public/vendor/"
            },
            assets: {
                expand: true,
                cwd: "client/assets/",
                src: ["styles/style.css", "styles/style.css.map", "images/*"],
                dest: "public/assets/"
            }
        }
    });

    // Tells grunt what order to load tasks/plugins
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default tasks
    grunt.registerTask('default', ['copy', 'uglify']);
};