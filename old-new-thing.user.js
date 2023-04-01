// ==UserScript==
// @name         Fixup links in The Old New Thing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/old-new-thing.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/old-new-thing.user.js
// @description  Try to fix links to other articles on The Old New Thing
// @author       Mark Jansen
// @match        https://devblogs.microsoft.com/oldnewthing/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // http://blogs.msdn.com/oldnewthing/archive/2004/09/20/231739.aspx
    let old_uri1 = /https?:\/\/blogs.msdn.com\/oldnewthing\/archive\/(\d+)\/(\d+)\/(\d+)\/(\d+).aspx/i;
    let old_uri2 = /https?:\/\/blogs.msdn.com\/b\/oldnewthing\/archive\/(\d+)\/(\d+)\/(\d+)\/(\d+).aspx/i;
    let old_uri3 = /https?:\/\/devblogs.microsoft.com\/oldnewthing\/archive\/(\d+)\/(\d+)\/(\d+)\/(\d+).aspx/i;
    let old_text = '(original)';


    function uri_fixup(year, month, day) {
        // 'https://devblogs.microsoft.com/oldnewthing/20040930-00/?p=37693';
        return 'https://devblogs.microsoft.com/oldnewthing/' + year + month + day + '-00';
    }

    let links = document.getElementsByTagName('a');
    for (let link of links) {
        if (link.textContent == old_text) {
            continue;
        }
        let match = link.href.match(old_uri1);
        if (match == null) {
            match = link.href.match(old_uri2);
        }
        if (match == null) {
            match = link.href.match(old_uri3);
        }
        if (match) {
            let oldLink = document.createElement('a');
            oldLink.href = link.href;
            oldLink.textContent = old_text;
            oldLink.style = 'margin-left: 6px; font-style: italic; font-size: small;';
            link.href = uri_fixup(match[1], match[2], match[3]);
            link.style = "text-decoration: text-decoration-color: #673ab7; text-decoration-style: wavy;";
            link.parentNode.insertBefore(oldLink, link.nextSibling);
        }
    };
})();
