'use strict';

angular.module('myApp.view1', ['ngRoute', 'angular-clipboard'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', function($scope) {
        $scope.imagePath = '/img/templates/template_1.png';
    })

    .controller('View1Ctrl', ['$scope', 'clipboard', function ($scope, clipboard) {
        $scope.clickHandler = function () {

            var template = document.getElementById('template');
            clipboard.copyText(template.innerHTML);
        };
        $scope.user = {
            name: '',
            position: '',
            company: 'Intend',
            phone: '',
            mobile: '',
            address: 'Ukraine, Kyiv, 10b Vozdvyzhenska Str',
            site: 'intend.kiev.ua',
            email: '',
            image: 'http://quickguidetoislam.com/wp-content/uploads/2014/06/A-circle-160x160.png',//'http://picnikstudio.com.ua/ya-sign/img/logo.png',
            url: 'http://picnikstudio.com.ua/ya-sign'
        };

//
// Canvas Image circle crop
//
        function resample_hermite(canvas, W, H, W2, H2) {
            var time1 = Date.now();
            W2 = Math.round(W2);
            H2 = Math.round(H2);
            var img = canvas.getContext("2d").getImageData(0, 0, W, H);
            var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
            var data = img.data;
            var data2 = img2.data;
            var ratio_w = W / W2;
            var ratio_h = H / H2;
            var ratio_w_half = Math.ceil(ratio_w / 2);
            var ratio_h_half = Math.ceil(ratio_h / 2);

            for (var j = 0; j < H2; j++) {
                for (var i = 0; i < W2; i++) {
                    var x2 = (i + j * W2) * 4;
                    var weight = 0;
                    var weights = 0;
                    var weights_alpha = 0;
                    var gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
                    var center_y = (j + 0.5) * ratio_h;
                    for (var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
                        var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                        var center_x = (i + 0.5) * ratio_w;
                        var w0 = dy * dy; //pre-calc part of w
                        for (var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
                            var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                            var w = Math.sqrt(w0 + dx * dx);
                            if (w >= -1 && w <= 1) {
                                //hermite filter
                                weight = 2 * w * w * w - 3 * w * w + 1;
                                if (weight > 0) {
                                    dx = 4 * (xx + yy * W);
                                    //alpha
                                    gx_a += weight * data[dx + 3];
                                    weights_alpha += weight;
                                    //colors
                                    if (data[dx + 3] < 255)
                                        weight = weight * data[dx + 3] / 250;
                                    gx_r += weight * data[dx];
                                    gx_g += weight * data[dx + 1];
                                    gx_b += weight * data[dx + 2];
                                    weights += weight;
                                }
                            }
                        }
                    }
                    data2[x2] = gx_r / weights;
                    data2[x2 + 1] = gx_g / weights;
                    data2[x2 + 2] = gx_b / weights;
                    data2[x2 + 3] = gx_a / weights_alpha;
                }
            }

            canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
            canvas.width = Math.max(W2, H2);
            canvas.height = Math.max(W2, H2);
            canvas.getContext("2d").putImageData(img2, 0, 0);

            //canvas.getContext("2d").restore();
        }

        var input = document.getElementById('image-file');
        input.addEventListener('change', handleFiles);

        var canvas = document.getElementById("canvas-prev");

        function handleFiles(e) {
            var ctx = canvas.getContext("2d");

            var url = URL.createObjectURL(e.target.files[0]);
            var img = new Image();

            img.onload = function () {

                var W = img.width;
                var H = img.height;

                var canvasRect = Math.max(W, H);

                canvas.width = canvasRect;
                canvas.height = canvasRect;

                var z = W / H;

                var offsetX = (canvasRect - W) / 2;
                var offsetY = (canvasRect - H) / 2;

                //console.log('canvasRect:', canvasRect);
                //console.log('offsetY:', offsetY);
                //console.log('H:', H);

                //var img2 = resample_hermite(canvas, W, H, 160, 160/z, offsetX, offsetY);

                ctx.save();

                // Create a circle
                ctx.beginPath();
                ctx.arc(canvasRect / 2, canvasRect / 2, canvasRect / 2, 0, Math.PI * 2, false);
                ctx.fillStyle = "pink";
                ctx.fill();

                // Clip to the current path
                ctx.clip();

                ctx.drawImage(img, offsetX, offsetY);

                // Undo the clipping
                ctx.restore();
                resample_hermite(canvas, canvasRect, canvasRect, 140, 140);

            };

            img.src = url;

            $scope.disabled = true;

            $scope.user.image = canvas.toDataURL('image/png');

        }

        $scope.disabled = false;

        $scope.save = function (ev) {
            console.log('save');
            var download = canvas.toDataURL('image/png');
            console.log(ev.target);
            ev.target.href = download;
        }

    }]);