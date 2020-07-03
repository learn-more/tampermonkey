// ==UserScript==
// @name         Expand mailing list threaded view inline
// @namespace    https://www.reactos.org/pipermail/ros-dev/
// @version      1.0
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/mailman-inline.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/mailman-inline.user.js
// @description  Expand 'threaded view' mailing lists inline
// @author       Mark Jansen
// @match        https://www.reactos.org/pipermail/*/thread.html
// @match        https://reactos.org/pipermail/*/thread.html
// @match        https://www.reactos.org/mailman/*/thread.html
// @match        https://www.winehq.org/pipermail/*/thread.html
// @match        http://lists.llvm.org/pipermail/*/thread.html

// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    // Hack so we can compare the color against something
    var dummy = $('<div/>').css('background-color', '#DCDCDC');
    var adjustedColor = $(dummy).css('background-color');
    // Hack to apply the bottom / right border
    var first = true;
$('li a').each(function() {
    var href2 = $(this).attr('href');
    var ohref = this.href;
    // Is this an a.href and is it not an anchor?
    if (typeof href2 !== typeof undefined && ohref != href2 && ohref.indexOf('#') < 0) {
        // Create the button
        var span = $('<span>[+]&nbsp;</span>').insertBefore($(this));
        // Full href (for loading)
        var href = this.href;
        // partial href (to use as id)
        var id = $(this).attr('href').replace(/\.[^/.]+$/, "");

        var parent = $(this).parent();  // parent is the 'li'
        var oth = parent.children('ul');
        // Create placeholder for post (with Loading... text for slow connections)
        var loading = $('<div class="' + id + '" style="display: none">Loading...</div>');
        if (oth.length > 0) {
            // Are there any nested posts?
            loading.insertBefore(oth.first());
        } else {
            loading.appendTo(parent);
        }
        // Simulate a 'link'
        span.addClass(id).css('font-family', 'Courier, monospace').css('cursor', 'pointer');

        // Listen to the first click, and load content on demand
        span.on('click', {id:id, href:href}, function(e){
            var id = e.data.id;
            var href = e.data.href;
            // Grab the 'pre' object from the page, and drop that in
            $('div.' + id).toggle().load(href + ' pre', function() {
                // Disable margin below text field so borders fit nicely,
                // add padding left so text does not disappear behind border
                $(this).children('pre').css('margin-bottom', '0px').css('padding-left', '3px');
            });
            // Update the button to a 'close' button
            $('span.' + e.data.id).text('[-] ');

            // Remove the first event handler, register a simple toggle function
            $(this).off('click').on('click', {id:id}, function(e) {
                var elem = $('div.' + e.data.id);
                $('span.' + e.data.id).text(elem.is(":visible") ? '[+] ' : '[-] ');
                elem.toggle();
            });
        });

        if (first) {
            // If this is the first entry, add a border to the right and bottom to make it look like a table
            first = false;
            parent.parent().css('border-right', '1px solid black').css('border-bottom', '1px solid black')
        }
        // Check the color of our container, so we do not start with the same color
        var pp = parent.parent().parent();
        var invert = false;
        if (pp.is('li')) {
            invert = pp.css('background-color') == adjustedColor;
        }
        var idx = (parent.index() + (invert ? 1 : 0)) % 2;
        if (idx == 0) {
            parent.css('background-color', '#DCDCDC');
        } else {
            parent.css('background-color', '#C0C0C0');
        }
        // Add a top and left border, so it appears as nested blocks
        parent.css('list-style', 'none').css('border-left', '1px solid black').css('border-top', '1px solid black');
    }
});

})();
