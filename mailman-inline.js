// ==UserScript==
// @name         Expand mailing list threaded view inline
// @namespace    https://www.reactos.org/pipermail/ros-dev/
// @version      0.3
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/mailman-inline.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/mailman-inline.js
// @description  Expand 'threaded view' mailing lists inline
// @author       Mark Jansen
// @match        https://www.reactos.org/pipermail/*/thread.html
// @match        https://www.reactos.org/mailman/*/thread.html
// @match        https://www.winehq.org/pipermail/*/thread.html
// @match        http://lists.llvm.org/pipermail/*/thread.html
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
$('li a').each(function() {
    var href2 = $(this).attr('href');
    var ohref = this.href;
    if (typeof href2 !== typeof undefined && ohref != href2 && ohref.indexOf('#') < 0) {
        var span = $('<span>[+]&nbsp;</span>').insertBefore($(this));
        
        var href = this.href; // Full href (for loading)
        var id = $(this).attr('href').replace(/\.[^/.]+$/, "");  // partial href (to use as id)

        var parent = $(this).parent();
        var oth = parent.children('ul');
        var loading = $('<div class="' + id + '" style="display: none;">Loading...</div>');
        if (oth.length > 0) {
            loading.insertBefore(oth.first());
        } else {
            loading.appendTo(parent);
        }
        span.addClass(id).css('font-family', 'Courier, monospace').css('cursor', 'pointer');
        
        span.on('click', {id:id, href:href}, function(e){
            var id = e.data.id;
            var href = e.data.href;
            $('div.' + id).toggle().load(href + ' pre');
            $('span.' + e.data.id).text('[-] ');
            
            $(this).off('click').on('click', {id:id}, function(e){
                var elem = $('div.' + e.data.id);
                $('span.' + e.data.id).text(elem.is(":visible") ? '[+] ' : '[-] ');
                elem.toggle();
            });
        });
    }
});
})();