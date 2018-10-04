// ==UserScript==
// @name         Patchbot links
// @namespace    http://tampermonkey.net/
// @version      0.2
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/jira-patchbot-links.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/jira-patchbot-links.user.js
// @description  Add patchbot links on jira attachments
// @author       Mark Jansen
// @match        https://jira.reactos.org/browse/CORE-*
// @match        https://jira.reactos.org/browse/ROSTESTS-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $('ol.item-attachments li dl dt a').each(function()
                                  {
        var issue = window.location.pathname;
        var x2 = issue.match(/\/browse\/([A-Z]+)-(\d*)/);
        var issuetype = x2[1];
        var issueid = x2[2];
        var patch = $(this).attr('href');
        var patchid = patch.match(/\/secure\/attachment\/(\d*)/)[1];
        //
        var full_url = 'https://build.reactos.org/builders/Build%20GCCLin_x86?force&issue=' + issuetype + '-' + issueid + '&patch=' + patchid;
        $(this).parent().parent().append('<dd><a href="' + full_url + '" target="_blank" style="margin-right:20px;">Testbot</a>&nbsp</dd>');
        full_url = 'https://build.reactos.org/builders/Test%20KVM%20AHK?force&issue=' + issuetype + '-' + issueid + '&patch=' + patchid;
        $(this).parent().parent().append('<dd><a href="' + full_url + '" target="_blank" style="margin-right:20px;">AHK</a>&nbsp</dd>');
        //alert('' + patchid + '|' + issueid);
    });

})();
