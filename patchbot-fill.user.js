// ==UserScript==
// @name         Patchbot fill in values
// @namespace    http://tampermonkey.net/
// @version      0.3
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/patchbot-fill.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/patchbot-fill.user.js
// @description  Script accompanying 'github-pr-author.user.js' and 'jira-patchbot-links.user.js' to fill in patchbot values
// @author       Mark Jansen
// @match        https://build.reactos.org/builders/*?force*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle("div.content div:nth-of-type(1) { width: 70%!important; }");
    GM_addStyle("div.content div:nth-of-type(2) { width: 25%!important; }");

    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var query_string = {};
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        query_string[pair[0]] = decodeURIComponent(pair[1]);
    }
    if (typeof query_string.issue !== "undefined" &&
       typeof query_string.patch !== "undefined")
    {
        var x = document.getElementsByName("reason");
        if (x.length > 0) { x[0].value = query_string.issue; }
        x = document.getElementsByName("property1_name");
        if (x.length > 0) { x[0].value = 'id'; }
        x = document.getElementsByName("property1_value");
        if (x.length > 0) { x[0].value = query_string.patch; }
    }
    if (typeof query_string.pr_id !== "undefined" &&
        typeof query_string.pr_type !== "undefined")
    {
        var id_type = query_string.pr_id + "/" + query_string.pr_type;
        var x2 = document.getElementsByName("reason");
        if (x2.length > 0) { x2[0].value = "PR #" + id_type; }
        x2 = document.getElementsByName("branch");
        if (x2.length > 0) { x2[0].value = "refs/pull/" + id_type; }
    }

})();
