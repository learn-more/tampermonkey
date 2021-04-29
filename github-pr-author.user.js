// ==UserScript==
// @name         Github improvements
// @namespace    http://tampermonkey.net/
// @version      0.17
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.user.js
// @description  Various github improvements, like: show committer and author name, 'known' authors, etc...
// @author       Mark Jansen
// @match        https://github.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==


(function() {
    'use strict';

    const known_users = {
        'Alexander Rechitskiy': [ [ 'rechitskiy', 'reactos.org' ] ],
        'Alexander Shaposhnikov': [ [ 'sanchaez', 'reactos.org' ] ],
        'Amine Khaldi': [ [ 'amine.khaldi', 'reactos.org' ] ],
        'Baruch Rutman': [ [ 'peterooch', 'gmail.com' ] ],
        'Bernhard Feichtinger': [ [ '43303168+biehdc', 'users.noreply.github.com' ] ],
        'Bișoc George': [ [ 'fraizeraust99', 'gmail.com' ] ],
        'Colin Finck': [ [ 'colin', 'reactos.org' ] ],
        'David Quintana': [ [ 'gigaherz', 'gmail.com' ] ],
        'Eric Kohl': [ [ 'eric.kohl', 'reactos.org' ] ],
        'Ged Murphy': [ [ 'gedmurphy', 'reactos.org' ] ],
        'Giannis Adamopoulos': [ [ 'gadamopoulos', 'reactos.org' ] ],
        'GitHub': [ [ 'noreply', 'github.com' ] ],
        'Hermès Bélusca-Maïto': [ [ 'hermes.belusca-maito', 'reactos.org' ] ],
        'Hermès BÉLUSCA - MAÏTO': [ [ 'hermes.belusca-maito', 'reactos.org' ] ],
        '赫杨': [ [ '1160386205', 'qq.com' ] ],
        'James Tabor': [ [ 'james.tabor', 'reactos.org' ] ],
        'Jérôme Gardou': [ [ 'jerome.gardou', 'reactos.org' ] ],
        'Joachim Henze': [ [ 'Joachim.Henze', 'reactos.org' ] ],
        'Katayama Hirofumi MZ': [ [ 'katayama.hirofumi.mz', 'gmail.com'] ],
        'Lauri Ojansivu': [ [ 'x', 'xet7.org' ] ],
        'Luo Yufan': [ [ 'njlyf2011', 'hotmail.com' ] ],
        'Manuel Bachmann': [ [ 'tarnyko', 'tarnyko.net' ] ],
        'Mark Jansen': [ [ 'mark.jansen', 'reactos.org' ] ],
        'Pierre Schweitzer': [ [ 'pierre', 'reactos.org' ] ],
        'Samuel Serapion': [ [ 'samcharly', 'hotmail.com' ] ],
        'Serge Gautherie': [ ['reactos-git_serge_171003', 'gautherie.fr'] ],
        'Stanislav Motylkov' : [ [ 'x86corez', 'gmail.com'] ],
        'Thomas Faber': [ [ 'thomas.faber', 'reactos.org' ] ],
        'Timo Kreuzer': [ [ 'timo.kreuzer', 'reactos.org' ] ],
        'Vadim Galyant': [ [ 'vgal', 'rambler.ru' ] ],
        'Victor Perevertkin': [ [ 'victor.perevertkin', 'reactos.org'] ],
    };
    const TOKEN_KEY = 'lm-gh-improvements-token';
    let token = localStorage.getItem(TOKEN_KEY);
    let headers = {};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    function knownCommitter(user) {
        let name = user.name;
        let email = user.email;

        var emails = known_users[name];
        if (emails) {
            for (var i = 0; i < emails.length; ++i) {
                if (emails[i].join('@') == email) {
                    return ' <span style="color:green;" title="Known email">&#x2714;</span>';
                }
            }
            return ' <span style="color:red;" title="Wrong email">&#x2718;</span>';
        }
        if (name.indexOf(' ') == -1 && name != 'GitHub') {
            return ' <span style="color:red; font-weight:bold;" title="Nickname">!</span>';
        }

        return ' ?';
    }

    function checkCommitters() {
        /* Remove the old one */
        $('#lm_gh_result').remove();

        let query = window.location.pathname;
        let pull_regex = /reactos\/(.*)\/pull\/(\d+)/;
        let pull_id = pull_regex.exec(query);

        if (pull_id) {
            addBox();
            $.ajax({
                url: 'https://api.github.com/repos/reactos/' + pull_id[1] + '/pulls/'+pull_id[2]+'/commits',
                headers: headers,
                complete: function(xhr) {
                    var result = '';
                    var json = xhr.responseJSON;
                    if (json.message == 'Not Found') {
                        $('#lm_gh_result').html('<span style="color:red">PR not found</span>');
                    } else {
                        addCommits(json, pull_id[2], pull_id[1]);
                    }
                }
            });
        } else {
            let commit_regex = /reactos\/commit\/([0-9a-f]+)/;
            let commit_id = commit_regex.exec(query);
            if (commit_id) {
                addBox();
                $.ajax({
                    url: 'https://api.github.com/repos/reactos/reactos/commits/'+commit_id[1],
                    headers: headers,
                    complete: function(xhr) {
                        var result = '';
                        var json = xhr.responseJSON;
                        if (json.message == 'Not Found') {
                            $('#lm_gh_result').html('<span style="color:red">Commit not found</span>');
                        } else {
                            addCommits([json]);
                        }
                    }
                });
            }
        }

        function addBox() {
            let box = $('<div id="lm_gh_result" style="position: fixed; top:164px; right:0px; border-left:1px solid var(--color-border-secondary); border-bottom:1px solid var(--color-border-secondary); background-color:var(--color-bg-secondary); min-width:10px; min-height:10px;"/>');
            $('body').append(box);
            $('#lm_gh_result')
                .html('<span>Querying</span>')
                .dblclick(
                function() {
                    let newToken = prompt('Enter your token', token || '');
                    if (newToken) {
                        token = newToken.trim();
                        localStorage.setItem(TOKEN_KEY, token);
                        //alert("New token:" + newToken);
                    }
                 });
        }

        function addCommits(commits, pull_id, pull_repo) {
            let result = '';
            let users = [];
            if(commits.length === 0) {
                result = '<span style="color:red">No commits found</span>';
            } else {
                let all = [];
                $.each(commits, function(index) {
                    let commit_str = commits[index].sha.substring(0, 7);
                    let commit = commits[index].commit;
                    let author_obj = commits[index].author;
                    let author = 'A:<a href="mailto:' + commit.author.email + '">' + commit.author.name + '</a>' + knownCommitter(commit.author) + '\n';
                    author +=    'C:<a href="mailto:' + commit.committer.email + '">' + commit.committer.name + '</a>' + knownCommitter(commit.committer);// + '\n';

                    let prev = $.grep(all, function(e) { return e.author == author; });
                    if (prev.length === 0) {
                        all.push({'commit': ['Commit: ', commit_str], 'author': author});
                    } else {
                        let c = prev[0].commit;
                        let third = (c.length % 3) === 0;
                        c[c.length-1] += (third ? ',\n' : ', ');
                        c.push(commit_str);
                    }
                });
                $.each(all, function(index) {
                    let point = all[index];
                    result += '<pre style="border-top:1px solid var(--color-border-secondary)">';
                    result += point.commit.join('') + '\n';
                    result += point.author;
                    result += '</pre>';
                });
            }
            if (typeof pull_id !== "undefined") {
                let full_url = 'https://build.reactos.org/builders/Build%20GCCLin_x86?force&pr_id=' + pull_id + '&pr_type=';
                result += '<hr style="margin:0px" /><pre>PR:<a href="#" id="pr_user_link">???</a>';
                result += '<hr style="margin:0px" /><pre>GCCLin: <a href="' + full_url + 'head" target="_blank">head</a>, ';
                result += '<a href="' + full_url + 'merge" target="_blank">merge</a>\n';
                full_url = 'https://build.reactos.org/builders/Test%20KVM%20AHK?force&pr_id=' + pull_id + '&pr_type=';
                result += '   AHK: <a href="' + full_url + 'head" target="_blank">head</a>, ';
                result += '<a href="' + full_url + 'merge" target="_blank">merge</a></pre>';
                $.ajax({
                    url: 'https://api.github.com/repos/reactos/' + pull_repo + '/pulls/'+pull_id,
                    complete: function(xhr) {
                        let json = xhr.responseJSON;
                        if (json.message != 'Not Found') {
                            var usrurl = json.user.url;
                            $.ajax({
                                url: usrurl,
                                headers: headers,
                                complete: function(xhr) {
                                    var result = '';
                                    var json = xhr.responseJSON;
                                    if (json.message == 'Not Found') {
                                        $('#pr_user_link').html('<span style="color:red">User not found</span>');
                                    } else {
                                        $('#pr_user_link').html(json.name || 'no public name').attr('href', json.html_url);
                                    }
                                }
                            });
                        }
                    }
                });
            }
            $('#lm_gh_result').html(result);
        }
    }
    checkCommitters();
    $(document).on('pjax:end', checkCommitters);
})();
