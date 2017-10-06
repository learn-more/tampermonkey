// ==UserScript==
// @name         Show commit authors
// @namespace    http://tampermonkey.net/
// @version      0.2
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.js
// @description  Show committer and author name in pull requests
// @author       Mark Jansen
// @match        https://github.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

// Get the latest version at https://reactos.org/wiki/User:Learn_more/Tampermonkey#Show_committer_and_author_name_in_pull_requests

(function() {
    'use strict';
    function addBox() {
        var box = $('<div id="lm_gh_result" style="position: fixed; top:54px; right:0px; border-left:1px solid #e1e4e8; border-bottom:1px solid #e1e4e8; background-color:#fafbfc; min-width:10px; min-height:10px;"/>');

        var query = window.location.pathname;
        var id_regex = /reactos\/reactos\/pull\/(\d+)/;
        var id = id_regex.exec(query);

        $('#lm_gh_result').remove();
        if (id) {
            $('body').append(box);
            $('#lm_gh_result').html('<span>Querying</span>');
            var url = 'https://api.github.com/repos/reactos/reactos/pulls/'+id[1]+'/commits';
            $.ajax({
                url: url,
                complete: function(xhr) {
                    var result = '';
                    var json = xhr.responseJSON;
                    if (json.message == 'Not Found') {
                        result = '<span style="color:red">PR not found</span>';
                    } else {
                        var commits = json;
                        if(commits.length === 0) {
                            result = '<span style="color:red">No commits found</span>';
                        } else {
                            $.each(commits, function(index) {
                                result += '<pre style="border-top:1px solid #e1e4e8">Commit: ' + commits[index].sha.substring(0, 8) + '\n';
                                var commit = commits[index].commit;
                                result += 'A:<a href="mailto:' + commit.author.email + '">' + commit.author.name + '</a>\n';
                                result += 'C:<a href="mailto:' + commit.committer.email + '">' + commit.committer.name + '</a></pre>';
                            });
                        }
                    }
                    $('#lm_gh_result').html(result);
                }
            });
        } else {
            // not a pull request page
        }
    }
    addBox();
    $(document).on('pjax:end', addBox);
})();