window.app = {

    init: function()
    {
        this.registerEvents();
        this.scroll.init();
        this.modal.init();
        this.overlay.init();
        this.ajaxLoader.init();
        this.listDropdowns.init();
    },

    registerEvents: function()
    {
        //
    },

    ajaxLoader: {
        request: null,
        init: function()
        {
            this.registerEvents();
        },

        registerEvents: function()
        {
            // load more results for listing pages
            $('[data-load-more]').on('click', function(e) {
                e.preventDefault();
                app.ajaxLoader.loadResults($(this));
            });
        },

        loadResults: function($clicked) {
            var itemCSS = $clicked.attr('data-load-more');
            var $container = $(itemCSS);
            var ajaxSourceUrl = $container.attr('data-ajax-source');
            var $items = $container.find('.item');
            var offset = $items.length;

            // Cancel prior requests
            if (this.request) {
                if (typeof(this.request.abort) == "function") {
                    this.request.abort();
                }
            }

            this.request = $.ajax({
                type: 'GET',
                url: ajaxSourceUrl + window.location.search,
                data: {
                    offset: offset
                }
            })
            .done(function(data, textStatus, jqXHR) {
                $container.append(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
        }
    },

    overlay: {

        init: function()
        {
            this.registerEvents();
        },

        registerEvents: function()
        {
            $('[data-overlay-target]').on('click', function(e) {
                if ($(window).width() >= 980) {

                    // close existing overlays
                    $('.overlay-open').each(function() {
                        $(this).fadeOut('fast').removeClass('overlay-open');
                    });

                    // Only show detail overlay on desktop
                    app.overlay.show($(this));
                    e.preventDefault();
                }
            });
        },

        show: function($item)
        {
            var itemWidth = $item.width();
            var overlay = $('[data-overlay=' + $item.attr('data-overlay-target') + ']');
            overlay.addClass('overlay-open');
            var overlayWidth = overlay.outerWidth();
            var position = $item.offset();
            var positionTop = position.top;
            var positionLeft = position.left;
            var windowWidth = $(window).width();

            console.log(overlay);

            // show images that have been hidden for purpose of avoid unnecessary server call
            overlay.find('[data-src]').each(function() {
                var src = $(this).attr('data-src');
                $(this).attr('src', src);
            });

            // Offset left position if overlay extends
            // outside of browser window
            if ((positionLeft + overlayWidth) > windowWidth) {
                positionLeft -= (overlayWidth - itemWidth);
            }

            overlay.stop(true, false).fadeOut('fast', function() {
                overlay.css('left', positionLeft);
                overlay.css('top', positionTop);
                overlay.fadeIn('fast');
            });

            // sometimes part of the overlay ends up offscreen.  let's scroll to top
            var modalOffset = overlay.offset().top - 25;
            app.utility.scrollWindowTo(modalOffset);
        },

        close: function($clicked)
        {
            var overlay = $clicked.parents('[data-overlay]');
            overlay.stop(true, false).fadeOut('fast');
        }

    },

    scroll: {

        constants: {
            topbarInvertOffset: 80
        },

        init: function() {
            this.registerEvents();
        },

        registerEvents: function() {
            /* When clicking Down arrows in hero section, scroll
            smoothly to link target */
            $('body').on('click', '.scroll-down', function(e) {
                var $this = $(this),
                    $target = $($this.attr('href')),
                    $topbar = $('.topbar'),
                    destination = $target.offset().top,
                    offset = 0;

                e.preventDefault();

                if(! $target.length) {
                    return;
                }

                if(destination >= app.scroll.constants.topbarInvertOffset) {
                    offset = $topbar.outerHeight() - 32;
                }

                $('html,body').animate({
                    scrollTop: destination - offset
                },1000);
            });

            $('.team-scroll').on('click', function(e) {
                var $this = $(this),
                    $target = $($this.attr('name')),
                    $topbar = $('.topbar'),
                    destination = $target.offset().top,
                    offset = 0;

                e.preventDefault();

                if(! $target.length) {
                    return;
                }

                if(destination >= app.scroll.constants.topbarInvertOffset) {
                    offset = $topbar.outerHeight() - 72;
                }

                $('html,body').animate({
                    scrollTop: destination - offset
                },1000);
            });

            /* Action for "Return to Top" link */
            $('body').on('click', '[data-return-top]', function(e) {
                var $this = $(this);

                e.preventDefault();

                $('html,body').animate({
                    scrollTop: 0
                },1000);
            });

            /* Listener for adding topbar class */
            $(window).on('scroll', function() {
                var $this = $(this),
                    scrollTop = $this.scrollTop(),
                    $topbar = $('.topbar');

                if(scrollTop >= app.scroll.constants.topbarInvertOffset) {
                    $topbar.addClass('invert');
                    return;
                }

                $topbar.removeClass('invert');
            });
        }

    },

    modal: {

        init: function() {
            this.registerEvents();
        },

        registerEvents: function() {

            // show full screen modal
            $('body').on('click', '[data-modal-full]', function(e) {
                // only show modal overlay on desktop
                if ($(window).width() >= 980) {
                    e.preventDefault();
                    var url = $(this).attr('href');
                    app.modal.launch($(this), url);
                } else {
                    if ($(this).attr('data-mobile-href')) {
                        e.preventDefault();
                        window.location.href = $(this).attr('data-mobile-href');
                    }
                }
            });

            $('body').on('click', '[data-modal-close]', function(e) {
                // if(! $('body.non-iframe-modal').length) {
                //     e.preventDefault();
                //     app.modal.close();
                // }
                e.preventDefault();
                app.modal.close();
            });

            $('body').on('click', '[data-modal-nav]', function(e) {
                e.preventDefault();
                if($(this).find('a').length) {
                    var url = $(this).find('a').attr('href');

                    console.log(url)
                    app.modal.setModalContent(url);
                }
            });

            // when in iframe context (used for modals), all links should target top or new except modal nav links
            $('.iframe-modal a').not('[data-modal-nav] a').each(function(e) {
                e.preventDefault();
                console.log('do something');
                // app.modal.setIframeLinkTargets($(this));
            });
        },

        launch: function(target, url) {
            $('body').remove('.modal-transition').append('<div class="modal-transition"></div>');

            // Sets overflow to hidden
            $('html, body').addClass('fullscreen');

            // Nudge, restore body scrollTop value
            // Prevents iframe scrollbar issue in WebKit with parent body
            var bodyScrollTop = $('body').scrollTop();
            $('body').scrollTop(bodyScrollTop + 1);
            $('body').scrollTop(bodyScrollTop);

            $.ajax({
                method: 'get',
                url: url,
                success: function(response) {
                    app.modal.display(response);
                }
            })
        },

        display: function(html) {
            $(".modal-transition").animate({opacity: 1, height: $(window).height() + 'px'}, 800, 'easeOutCirc', function() {
                $(this).addClass('full');
                $('body').append(html);
            });
        },

        launch2: function(target, url) {

            $('body').remove('.modal-transition').append('<div class="modal-transition"></div>');

            // Sets overflow to hidden
            $('html, body').addClass('fullscreen');

            // Nudge, restore body scrollTop value
            // Prevents iframe scrollbar issue in WebKit with parent body
            var bodyScrollTop = $('body').scrollTop();
            $('body').scrollTop(bodyScrollTop + 1);
            $('body').scrollTop(bodyScrollTop);

            // Animate transition, build iframe and add to page
            $(".modal-transition").animate({opacity: 1, height: $(window).height() + 'px'}, 800, 'easeOutCirc', function() {
                // Sets modal-transition height to 100%
                $(this).addClass('full');

                // Build iframe for fullscreen modal
                var iframe = $(document.createElement('iframe'));
                iframe.fadeTo(0, 0);
                iframe.on('load', function() {
                    iframe.fadeTo(600, 1);
                });
                url += (url.indexOf('?') == -1 ? '?' : '&') + 'iframe=true' ;
                iframe.attr('src', url);
                $('body').append(iframe);
            });
        },

        close: function() {
            $('.modal-transition').remove();
            $('html, body').removeClass('fullscreen');
            $('body').find('.modal').remove();
        },

        setModalContent: function(url) {
            $('body').find('.page-modal').remove();
            $.ajax({
                method: 'get',
                url: url,
                success: function(response) {
                    $('body').append(response);
                }
            })
        },

        setIframeLinkTargets: function($clicked) {

            var link = $clicked.attr('href').toLowerCase();

            // if link is mailto, do nothing
            if(link.indexOf('mailto:') != -1) {
                return;
            }

            // is the link on our domain?  If so, target parent
            // otherwise target new window.
            var linkDomain = app.utility.getDomainFromUrlString(link);
            if(linkDomain.indexOf('pamlicocapital') == -1) {
                $clicked.attr('target', '_blank');
            } else {
                $clicked.attr('target', '_parent');
            }
        }
    },

    listDropdowns:
    {
        init: function()
        {
            this.registerEvents();
        },

        registerEvents: function()
        {
            // toggle dropdown on mobile where there is no hover state
            $('[data-list-dropdown]').on('click', function(e) {
                if($(this).attr('data-filter') == 'true') {
                    e.preventDefault();
                }

                if ($(window).width() < 980) {
                    $(this).find('li ul').toggle();
                }
            });

            // add active class to selected item and update top level text
            $('[data-list-dropdown] ul li a').on('click', function(e) {

                var $container = $(this).parents('[data-list-dropdown]');
                if($container.attr('data-filter') == 'true') {
                    e.preventDefault();
                }

                var text = $(this).text();
                $container.find('li a').eq(0).text(text);
                $container.find('li ul li a').removeClass('active');
                $(this).addClass('active');
            });
        }
    },

    utility: {
        getDomainFromUrlString: function (urlString) {
            var a = document.createElement('a');
            a.href = urlString;
            return a.hostname;
        },

        scrollWindowTo: function(offset)
        {
            $('html, body').animate({
                scrollTop: offset
            }, 500);
        }
    }
}

/*
 * Header
 */
var Header = (function() {

    function initHeader() {
        if ($('header').length > 0) {
            $('.navigation .toggle').on('click', toggleNav);
        }

        // Hide nav on click outside element
        // http://stackoverflow.com/a/153047
        $('html').on('click', function() {
            $('nav').removeClass('on');
            $('nav').removeAttr('style');
        });
        $('nav').on('click', function(e) {
            e.stopPropagation();
        });

        // Nav should be document height on News, Privacy pages
        if ($('.page-news, .page-privacy').length > 0) {
            $(window).on('resize', function() {
                resizeNav();
            });
            resizeNav();
        }

        // Preload any data-blur attribute value
        $('.hero[data-blur]').each(function() {
            var src = $(this).data('blur');
            if (src.length > 0) {
                var image = new Image()
                image.src = src;
            }
        });
    }

    function toggleNav() {
        if ($('.topbar').hasClass('on')) {
            $('.topbar').removeClass('on');
            $('.topbar').removeAttr('style');
            return false;
        }

        $('.topbar').addClass('on');
        resizeNav();
        return false;
    }

    function resizeNav() {
        if ($('.page-news, .page-privacy').length > 0) {
            $('.topbar.on').height($(document).height());
        }
    }

    return {
        init: function() {
            initHeader();
        }
    };

})();

/*
 * Latest News
 */

var LatestNews = (function() {

    var containerHeight, itemsPerPage, itemTotal, pageCurrent, pages;

    itemsPerPage = 3;

    function initLatestNews() {
        if ($('.latest-news').length > 0) {
            // Set container, item information
            setSliderInfo();

            // Show visible items
            setItemsVisible();

            // Next, prev buttons
            $('.latest-news .next').on('click', function() {
                nextPage();
                return false;
            });
            $('.latest-news .prev').on('click', function() {
                prevPage();
                return false;
            });

            // Mobile resize listener
            $(window).on('resize', function() {
                resizePage();
            });
            resizePage();
        }
    }

    function setSliderInfo() {
        containerHeight = $('.latest-news .items').height();
        itemTotal = $('.latest-news .item').length;
        pages = Math.ceil(itemTotal / itemsPerPage);
        pageCurrent = 1;

        // Adjust container height to tallest item
        $('.latest-news .item').each(function() {
            var itemHeight = $(this).outerHeight();
            if (itemHeight > containerHeight) {
                containerHeight = itemHeight + 10;
            }
        });

        $('.latest-news .items').height(containerHeight);
        $('.latest-news .items .item').height(containerHeight - 10);
    }

    function getPageOffset() {
        return -((pageCurrent - 1) * containerHeight);
    }

    function setItemsVisible() {
        var itemIndexStart = (pageCurrent - 1) * itemsPerPage;
        var itemIndexEnd = itemIndexStart + (itemsPerPage - 1);

        $('.latest-news .item').removeClass('visible');

        if (itemsPerPage > 1) {
            for (var i = itemIndexStart; i <= itemIndexEnd; i++) {
                $('.latest-news .item').eq(i).addClass('visible');
            }
            return;
        }

        $('.latest-news .item').eq(itemIndexStart).addClass('visible');
    }

    function changePage() {
        // Move slider
        // TODO: Apply margin-left with CSS, use transition/translate3d for animation?
        $('.latest-news .group').stop(false, true).animate({marginTop: getPageOffset()}, 600, 'easeOutCirc');
        setItemsVisible();

        // Handle disabling next, prev buttons
        nextPageState();
        prevPageState();
    }

    function resizePage() {
        var windowWidth = $(window).width();
        if(windowWidth > 980) {
            if (windowWidth > 1152) {
                itemsPerPage = 3;
            }
            if (windowWidth <= 1152) {
                itemsPerPage = 2;
            }

            // Reset container, item information
            setSliderInfo();

            // Check current page value
            // Pages may vary between desktop vs mobile
            if (pageCurrent > pages) {
                pageCurrent = pages;
            }
            changePage();
        } else {
            // $('.latest-news .items .item').gt(2)
        }
    }

    function nextPage() {
        var nextPage = pageCurrent + 1;
        if (nextPage <= pages) {
            pageCurrent = nextPage;
            changePage();
        }
    }

    function nextPageState() {
        if (pageCurrent >= pages) {
            $('.latest-news .next').addClass('disabled');
            return;
        }

        $('.latest-news .next').removeClass('disabled');
    }

    function prevPage() {
        var prevPage = pageCurrent - 1;
        if (prevPage > 0) {
            pageCurrent = prevPage;
            changePage();
        }
    }

    function prevPageState() {
        if (pageCurrent <= 1) {
            $('.latest-news .prev').addClass('disabled');
            return;
        }

        $('.latest-news .prev').removeClass('disabled');
    }

    return {
        init: function() {
            initLatestNews();
        }
    };

})();

/*
 * Slider
 */

var Slider = (function() {

    var containerWidth, isMobile, itemTotal, itemWidth, firstVisibleSlide, itemsPerPage;

    isMobile = false;
    firstVisibleSlide = 1;

    function initSlider() {
        if ($('.slider').length > 0) {
            // Set container, item information
            setSliderInfo();

            // Show visible items
            setItemsVisible();

            // Next, prev buttons
            $('.slider-next').on('click', function() {
                nextPage();
                return false;
            });
            $('.slider-prev').on('click', function() {
                prevPage();
                return false;
            });

            // Swipe events
            $('.slider').on('swipeleft', function() {
                nextPage();
                return false;
            });
            $('.slider').on('swiperight', function() {
                prevPage();
                return false;
            });

            // Mobile resize listener
            $(window).on('resize', function() {
                resizePage();
            });
            resizePage();
        }
    }

    function setSliderInfo() {
        containerWidth = $('.slider .items').width();
        itemTotal = $('.slider .item').length;
        itemWidth = $('.slider .item:eq(0)').width();

        // Hide arrows if single page
        if (itemTotal == 1) {
            $('.slider-next, .slider-prev').hide();
        }

        // Set group width for animation
        $('.slider .group').width(itemTotal * containerWidth);
    }

    function getPageOffset() {
        return -((firstVisibleSlide - 1) * itemWidth);
    }

    function setItemsVisible() {
        // Set items visible based on items per page and
        // index offset based on firstVisibleSlide value
        itemsPerPage = Math.floor(containerWidth / itemWidth);

        $('.slider .item').removeClass('visible');

        if (itemsPerPage > 1) {
            for (var i = firstVisibleSlide; i <= firstVisibleSlide - 1 + itemsPerPage; i++) {
                $('.slider .item').eq(i-1).addClass('visible');
            }
            return;
        }

        $('.slider .item').eq(firstVisibleSlide - 1).addClass('visible');
    }

    function changePage() {
        // Move slider
        // TODO: Apply margin-left with CSS, use transition/translate3d for animation?
        $('.slider .group').stop(false, true).animate({
            marginLeft: getPageOffset()
        }, 800, 'easeOutCirc');
        setItemsVisible();

        // Handle disabling next, prev buttons
        nextPageState();
        prevPageState();
    }

    function resizePage() {
        // Mobile layout
        if ($(window).width() <= 980) {
            $('.slider .item').width($(window).width());

            // Special adjustment for Exec Network variable height items
            // Size slider items div height to tallest item
            if ($('.page-exec-network').length > 0) {
                $('.slider .item').each(function() {
                    // sliderOffset is group div top value
                    // plus 180px for prev, next buttons
                    var sliderOffset = 349;

                    var sliderHeight = $('.slider .items').height();
                    var itemHeight = $(this).outerHeight() + sliderOffset;

                    if (itemHeight > sliderHeight) {
                        $('.slider .items').height(itemHeight);
                    }
                });
            }
        }

        // Desktop layout
        if ($(window).width() > 980) {
            // Remove fixed width added for mobile
            $('.slider .items, .slider .item').css('width', '');
        }

        // Reset container, item information
        setSliderInfo();

        // Check current page value
        // Pages may vary between desktop vs mobile
        if (firstVisibleSlide > itemTotal) {
            firstVisibleSlide = itemTotal;
        }
        changePage();
    }

    function nextPage() {
        var nextPage = firstVisibleSlide;
        if (nextPage + itemsPerPage <= itemTotal) {
            firstVisibleSlide = nextPage + 1;
            changePage();
        }
    }

    function nextPageState() {
        if (firstVisibleSlide + itemsPerPage > itemTotal) {
            $('.slider-next').addClass('disabled');
            return;
        }

        $('.slider-next').removeClass('disabled');
    }

    function prevPage() {
        var prevPage = firstVisibleSlide - 1;
        if (prevPage > 0) {
            firstVisibleSlide = prevPage;
            changePage();
        }
    }

    function prevPageState() {
        if (firstVisibleSlide <= 1) {
            $('.slider-prev').addClass('disabled');
            return;
        }

        $('.slider-prev').removeClass('disabled');
    }

    return {
        init: function() {
            initSlider();
        }
    };

})();

/*
 * Subnav
 */

var Subnav = (function() {
    function initSubnav() {
        if ($('.subnav').length > 0) {
            var subnavTop = $('.subnav').offset().top;
            $(window).on('scroll', function() {
                if ($(this).scrollTop() >= subnavTop) {
                    $('.subnav, body').addClass('fixed');
                    return;
                }

                $('.subnav, body').removeClass('fixed');
            });
        }
    }

    return {
        init: function() {
            initSubnav();
        }
    };
})();

$(function() {
    app.init();
    Header.init();
    LatestNews.init();
    Slider.init();
    Subnav.init();
});
