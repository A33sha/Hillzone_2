window.app.home = {

    init: function()
    {
        this.registerEvents();
        app.home.initializeVideo();
    },

    registerEvents: function()
    {
        // trim video container height to match video height
        $(window).on('resize', function() {
            app.home.resizeVideoContainer();
        });

        $(window).load(function() {
            app.home.resizeVideoContainer();
        });
    },

    resizeVideoContainer: function() {
        if($(window).width() >= 960) {
            var $video = $('video');
            var videoHeight = $video.height();
            var videoWidth = $video.width();
            var windowWidth = $(window).width();

            if(windowWidth < 1443) {
                $video.width(1443);
            } else {
                $video.css('width', '100%');
            }
        }
    },

    initializeVideo: function() {
       // load video via javascript.  we could do this without js but there was an issue
        // with white screen on chrome via non-js approach so trying this
        var video = document.getElementById('pamlico-homepage-video');
        if (video) {
            video.addEventListener('canplay', function() {
                // video.play();
            }, false);
            // video.src = $(video).attr('data-src');
            // video.type = $(video).attr('data-src-type');
        }
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    window.app.home.init();
});
