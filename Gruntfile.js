module.exports = function(grunt) {

  var exec = require("child_process").exec;
  var path = require("path");
  var fs = require("fs");
  var Zip = require("jszip");

  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.initConfig({
    less: {
      light: {
        files: {
          "css/caret.css": "css/seed.less",
          "css/caret-twilight.css": "css/seed-twilight.less",
          "css/caret-dark.css": "css/seed-dark.less"
        }
      }
    },
    watch: {
      css: {
        files: ["css/*.less"],
        tasks: ["pwa"]
      },
      js: {
        files: ["js/*.js"],
        tasks: ["pwa"]
      },
      options: {
        spawn: false
      }
    },
    copy:  [
      "config/**",
      "_locales/**",
      "js/**",
      "css/*.css",//leave the LESS behind
      "**/*.html",//both main.html and the templates
      "templates/*",
      "require.js",
      "background.js",
      "installer.js",
      "./*.png", //in case we add images at some point
      "!node_modules/**"
    ]
  });

  grunt.registerTask("default", ["less", "watch"]);
  grunt.registerTask("pwa", ["less", "cleanup", "copyUnpacked"]);
  grunt.registerTask("debug", ["pwa", "watch"]);

  grunt.registerTask("copyUnpacked", "Copies files to the build directory", function() {
    var srcPatterns = grunt.config.get("copy");
    var files = grunt.file.expandMapping(srcPatterns, "./build/unpacked", {
      filter: "isFile"
    });
    files.forEach(function(f) {
      grunt.file.copy(f.src[0], f.dest);
    });
  });

  grunt.registerTask("cleanup", "Removes the build/unpacked directory", function() {
    var c = this.async();
    exec("rm -rf ./build/*", c);
  });

  grunt.registerTask("checkLocale", "Finds unregistered strings for a given locale; checkLocale:XX for a language code XX", function(language) {
    var english = require("./_locales/en/messages.json");
    var other = require(`./_locales/${language}/messages.json`);
    console.log(`Checking ${language} against English string file`);
    for (var k in english) {
      if (!(k in other)) {
        console.log(`- Missing string: ${k}`);
      }
    }
  })

};
