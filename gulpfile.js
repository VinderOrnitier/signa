var gulp         = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    plumber      = require('gulp-plumber'),
    sourcemaps   = require('gulp-sourcemaps'),
    browserSync  = require('browser-sync').create(), // Подключаем Browser Sync
    cssComb      = require('gulp-csscomb'),
    reload       = browserSync.reload,
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    cmq          = require('gulp-merge-media-queries'),
    cleanCss     = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

gulp.task('sass',function(){
    gulp.src(['app/scss/*.+(scss|sass)'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], { cascade: true })) // Создаем префиксы
        .pipe(cssComb())
        .pipe(cmq({log:true})) // Обеденяем медиа запросы
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({stream:true}));
});

gulp.task('js',function(){
    gulp.src([ // Берем все необходимые библиотеки
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-messages/angular-messages.js',
            'bower_components/angular-clipboard/angular-clipboard.js',
            'bower_components/angular-animate/angular-animate.js',
        ])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify())
        .pipe(gulp.dest('app/javascript'))
        .pipe(reload({stream: true}));
});

gulp.task('js-main',function(){
    gulp.src(['app/*.js'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/javascript'))
        .pipe(reload({stream: true}));
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('image',function(){
    gulp.src(['app/img/**/*'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('app/image'));
});

//gulp.task('jade',function(){
//    gulp.src(['app/jade/index.jade'])
//        .pipe(plumber({
//            handleError: function (err) {
//                console.log(err);
//                this.emit('end');
//            }
//        }))
//        .pipe(jade())
//        .pipe(gulp.dest('./app'))
//        .pipe(gulp.dest('./dist'));
//});
//
//gulp.task('build', ['clean', 'jade', 'image', 'sass', 'js', 'js-main'], function() {
//
//    //var buildCss = gulp.src([ // Переносим библиотеки в продакшен
//    //        'app/css/main.css'
//    //    ])
//    //    .pipe(gulp.dest('dist/css'))
//
//    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
//        .pipe(gulp.dest('dist/fonts'))
//
//    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
//        .pipe(gulp.dest('dist'));
//
//});

gulp.task('default', ['sass', 'js', 'js-main', 'image'], function(){
    browserSync.init({
        server: { // Определяем параметры сервера
            baseDir: './app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js',['js', 'js-main']);
    gulp.watch('app/scss/**/*.sass',['sass']);
    gulp.watch('app/img/**/*',['image']);
});