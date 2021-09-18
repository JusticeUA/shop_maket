const fileinclude = require('gulp-file-include')

let  project_folder = require("path").basename(__dirname)
let source_folder = "#src"

let fs = require('fs')

let path = {
    build:{
        html: project_folder+"/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    scr:{
        html: [source_folder+"/*.html", "!"+source_folder+"/_*.html" ],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch:{
        html: source_folder+"/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",        
    },
    clean: "./" + project_folder + "/"
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync= require("browser-sync").create(),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    //imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter"),
    svgSprite = require("gulp-svg-sprite")

    
function browserSync(param){  
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/"
        },
        port:3000,
        notify:false
    })
}

function html () {
    return src(path.scr.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css (params) {
    return src(path.scr.css) 
    .pipe(
        scss({
             outputStyle: 'expanded' }).on('error', scss.logError)
        
    ) 
    .pipe(
        group_media() /* шукаэм ы групуэмо медыа запити */
        )
    .pipe(
        autoprefixer({
            overrideBrowserslist: ["last 5 versions"],  /* підтримка 5 останніх версій браузера  */
            cascade:true
        })
    ) 
    .pipe(webpcss())
    .pipe(dest(path.build.css))   /* вигружаєм норм файл css перед зжиманням */
    .pipe(clean_css()) /*  чистим і зжимаємо файл css, важливо для оптимізації, швидше загружається */
    .pipe(
        rename({
            extname: ".min.css"  /*перейменовуємо і добавляємо до назви мін */
        })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js () {
    return src(path.scr.js)
    .pipe(fileinclude())   /*збирає різні js в 1  */
    .pipe(dest(path.build.js))
    .pipe(
        uglify() /*зжимаємо js */
    ) 
    .pipe(
        rename({
            extname: ".min.js"  /*перейменовуємо і добавляємо до назви мін */
        })
    )
    .pipe(dest(path.build.js))
    
    .pipe(browsersync.stream())
}

function images () {
    return src(path.scr.img) 
    .pipe(
        webp({
            quality: 70   // можна настроювати більше чи менше
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.scr.img))
 /*   .pipe(
        imagemin({
            progressive:true,
            svgoPlugins:[{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        })
    )   */
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg", //sprite file name
                    example:true // створює html файл з прикладами іконок
                }
            },
        }
        ))
        .pipe(dest(path.build.img))
})

function fonts (){
    src(path.scr.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.scr.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))    
}

gulp.task('otf2ttf', function () {
    return scr([source_folder + 'fonts/*.otf'])
    .pipe(fonter({
        formats:['ttf']
    }))
    .pipe(dest(source_folder + '/fonts/'))
})

function fontsStyle(params) {

    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
        if (items) {
            let c_fontname;
             for (var i = 0; i < items.length; i++) {
                let fontname = items[i].split('.');
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                }
                 c_fontname = fontname;
            }
        }
    })
    }
    }
    
    function cb() { }

function cb () {

}

function watchFiles(params) {
    gulp.watch([path.watch.html], html),
    gulp.watch([path.watch.css], css),
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], images)

}

function clean (params) {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts))
let watch = gulp.parallel(build, watchFiles, browserSync)


exports.fontsStyle = fontsStyle
exports.fonts = fonts
exports.images = images
exports.js = js
exports.css = css
exports.html = html
exports.build = build
exports.watch = watch
exports.default = watch