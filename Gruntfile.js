
const concatJSFiles = [
	'assets/js/plugins.js',
	'assets/js/jarallax.js',
	'assets/js/bootstrap.min.js',
	'assets/js/theme.js',
];


module.exports = function (grunt) {
	"use strict";
	var pkgInfo = grunt.file.readJSON("package.json");
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		// Autoprefixer.
		postcss: {
			options: {
				style: 'expanded',
			},
			dist: {
				src: ["assets/css/*.css", "*.css"]
			}
		},

		// SASS
		sass: {
			options: {
				precision: 10
			},
			dist: {
				options: {
					style: "expanded"
				},

				files: [
					{
						"style.css": "assets/sass/style.scss",
						"editor-style.css": "assets/sass/editor.scss"
					}
				]
			}
		},

		// Watch changes for assets.
		watch: {
			css: {
				files: ["assets/sass/*.scss", "assets/js/*.js", "!assets/js/theme-all.js", "!assets/js/theme-all.min.js"],
				tasks: ["css", 'concat']
			}
		},

		copy: {
			main: {
				options: {
					mode: true
				},
				src: [
					"**",
					"!node_modules/**",
					"!build/**",
					"!css/sourcemap/**",
					"!.git/**",
					"!bin/**",
					"!.gitlab-ci.yml",
					"!bin/**",
					"!tests/**",
					"!phpunit.xml.dist",
					"!*.sh",
					"!*.map",
					"!Gruntfile.js",
					"!package.json",
					"!.gitignore",
					"!phpunit.xml",
					"!README.md",
					"!sass/**",
					"!codesniffer.ruleset.xml",
					"!vendor/**",
					"!composer.json",
					"!composer.lock",
					"!package-lock.json",
					"!phpcs.xml.dist"
				],
				dest: "onepress/"
			}
		},

		compress: {
			main: {
				options: {
					archive: "onepress-" + pkgInfo.version + ".zip",
					mode: "zip"
				},
				files: [
					{
						src: ["./onepress/**"]
					}
				]
			}
		},

		clean: {
			main: ["onepress"],
			zip: ["*.zip"]
		},

		bumpup: {
			options: {
				updateProps: {
					pkg: "package.json"
				}
			},
			file: "package.json"
		},

		replace: {
			theme_main: {
				src: ["style.css", "assets/sass/style.scss", "editor-style.css", "assets/sass/editor.scss"],
				overwrite: true,
				replacements: [
					{
						from: /Version: \bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?(?:\+[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?\b/g,
						to: "Version: <%= pkg.version %>"
					}
				]
			}
		},

		concat: {
			options: {
				separator: '\n',
				sourceMap: true,
			},
			dist: {
				src: concatJSFiles,
				dest: 'assets/js/theme-all.js',
			},
		},

		uglify: {
			options: {
				sourceMap: false,
				mangle: false
			},
			my_target: {
				files: {
					'assets/js/theme-all.min.js': ['assets/js/theme-all.js']
				}
			}
		}
	});

	// Load NPM tasks to be used here
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-postcss");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-wp-i18n");
	grunt.loadNpmTasks("grunt-bumpup");
	grunt.loadNpmTasks("grunt-text-replace");

	// Register tasks
	grunt.registerTask("default", ["watch", "css"]);
	grunt.registerTask("css", [
		"sass"
		//'postcss',
		//'cssmin'
	]);

	// To release new version just runt 2 commands below
	// Re create everything: grunt release --ver=<version_number>
	// Zip file installable: grunt zipfile

	grunt.registerTask("zipfile", [
		"clean:zip",
		"copy:main",
		"compress:main",
		"clean:main"
	]);
	grunt.registerTask("release", function (ver) {
		let newVersion = pkgInfo.version
		grunt.task.run("bumpup:" + newVersion);
		grunt.task.run("replace");

		// i18n
		// grunt.task.run(['addtextdomain', 'makepot']);
		// re create css file and min
		grunt.task.run(["css", "postcss", "concat", 'uglify']);
	});
};
