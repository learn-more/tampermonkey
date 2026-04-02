// ==UserScript==
// @name         Github improvements
// @namespace    http://tampermonkey.net/
// @version      0.40
// @updateURL    https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.user.js
// @downloadURL  https://raw.githubusercontent.com/learn-more/tampermonkey/master/github-pr-author.user.js
// @description  Show committer/author info on ReactOS PRs and commits
// @author       Mark Jansen
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const KNOWN = {
        'Alexander Rechitskiy':  [['rechitskiy',               'reactos.org']],
        'Alexander Shaposhnikov':[['sanchaez',                  'reactos.org']],
        'Amine Khaldi':          [['amine.khaldi',              'reactos.org']],
        'Baruch Rutman':         [['peterooch',                 'gmail.com']],
        'Bernhard Feichtinger':  [['43303168+biehdc',           'users.noreply.github.com']],
        'Bișoc George':          [['fraizeraust99',             'gmail.com']],
        'Colin Finck':           [['colin',                     'reactos.org']],
        'Carl J. Bialorucki':    [['carl.bialorucki',           'reactos.org']],
        'Daniel Victor':         [['ilauncherdeveloper',        'gmail.com']],
        'David Quintana':        [['gigaherz',                  'gmail.com']],
        'Dmitry Borisov':        [['di.sean',                   'protonmail.com']],
        'Doug Lyons':            [['douglyons',                 'douglyons.com']],
        'Eric Kohl':             [['eric.kohl',                 'reactos.org']],
        'Ged Murphy':            [['gedmurphy',                 'reactos.org']],
        'Giannis Adamopoulos':   [['gadamopoulos',              'reactos.org']],
        'GitHub':                [['noreply',                   'github.com']],
        'Hermès Bélusca-Maïto':  [['hermes.belusca-maito',     'reactos.org']],
        'Hermès BÉLUSCA - MAÏTO':[['hermes.belusca-maito',     'reactos.org']],
        '赫杨':                   [['1160386205',                'qq.com']],
        'James Tabor':           [['james.tabor',               'reactos.org']],
        'Jérôme Gardou':         [['jerome.gardou',             'reactos.org']],
        'Joachim Henze':         [['Joachim.Henze',             'reactos.org']],
        'Johannes Anderwald':    [['johannes.anderwald',        'reactos.org']],
        'Justin Miller':         [['justin.miller',             'reactos.org']],
        'Katayama Hirofumi MZ':  [['katayama.hirofumi.mz',      'gmail.com']],
        'Lauri Ojansivu':        [['x',                         'xet7.org']],
        'Luo Yufan':             [['njlyf2011',                 'hotmail.com']],
        'Manuel Bachmann':       [['tarnyko',                   'tarnyko.net']],
        'Mark Jansen':           [['mark.jansen',               'reactos.org']],
        'Mikhail Tyukin':        [['mishakeys20',               'gmail.com']],
        'Oleg Dubinskiy':        [['oleg.dubinskiy',            'reactos.org']],
        'Pierre Schweitzer':     [['pierre',                    'reactos.org']],
        'Samuel Serapion':       [['samcharly',                 'hotmail.com']],
        'Serge Gautherie':       [['reactos-git_serge_171003',  'gautherie.fr']],
        'Stanislav Motylkov':    [['x86corez',                  'gmail.com']],
        'Thomas Faber':          [['thomas.faber',              'reactos.org']],
        'Timo Kreuzer':          [['timo.kreuzer',              'reactos.org']],
        'Vadim Galyant':         [['vgal',                      'rambler.ru']],
        'Victor Perevertkin':    [['victor.perevertkin',        'reactos.org']],
        'Vitaly Orekhov':        [['vkvo2000',                  'vivaldi.net']],
    };

    const TOKEN_KEY = 'lm-gh-improvements-token';
    let token = localStorage.getItem(TOKEN_KEY) || '';
    const authHeaders = () => token ? { Authorization: `token ${token}` } : {};

    const api = (url) => fetch('https://api.github.com' + url, { headers: authHeaders() }).then(r => r.json());

    function statusBadge({ name, email }) {
        const entries = KNOWN[name];
        let [color, title, text] =
            !entries                           ? ['', 'Unknown email', '?'] :
            entries.some(e => e.join('@') === email) ? ['green', 'Known email', '✔'] :
                                                 ['red',   'Wrong email',  '✘'];
        if (!entries && name.indexOf(' ') === -1 && name !== 'GitHub')
            [color, title, text] = ['red', 'Nickname', '!'];

        const s = document.createElement('span');
        Object.assign(s.style, { font: '12px monospace', fontWeight: color === 'red' && text === '!' ? 'bold' : '', color });
        s.title = title;
        s.textContent = text;
        return s;
    }

    function userLink(person) {
        const frag = document.createDocumentFragment();
        const a = document.createElement('a');
        a.href = `mailto:${person.email}`;
        a.textContent = person.name;
        frag.append(a, ' ', statusBadge(person));
        return frag;
    }

    function findTarget() {
        const selectors = [
            '[data-testid="base-ref-to-head-ref"]',
            '.prc-PageHeader-Description',
            '[class*="PageHeader-description"]',
            '[class*="PageHeader-Description"]',
            '.gh-header-meta',
            '#partial-discussion-header .flex-md-row',
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
    }

    function injectResult(content) {
        document.getElementById('lm_gh_result')?.remove();
        const target = findTarget();
        if (!target) return;

        const div = document.createElement('div');
        div.id = 'lm_gh_result';
        div.style.cssText = 'width:100%; font-size:12px; margin-top:4px;';
        div.appendChild(content);
        div.addEventListener('dblclick', () => {
            const t = prompt('Enter your GitHub token (https://github.com/settings/tokens)', token);
            if (t !== null) { token = t.trim(); localStorage.setItem(TOKEN_KEY, token); }
        });
        target.appendChild(div);
    }

    function buildCommitInfo(commits, pull_id, pull_repo) {
        const frag = document.createDocumentFragment();

        if (!commits.length) {
            const s = document.createElement('span');
            s.style.color = 'red';
            s.textContent = 'No commits found';
            return injectResult(frag);
        }

        // Optional PR opener line
        let prUserSpan;
        if (pull_id != null) {
            prUserSpan = document.createElement('span');
            prUserSpan.textContent = '…';
            const openerDiv = document.createElement('div');
            openerDiv.id = 'lm_gh_pr_opener';
            openerDiv.style.marginBottom = '4px';
            openerDiv.append('Pull request opened by: ', prUserSpan);
            frag.appendChild(openerDiv);
        }

        // Group commits by unique author+committer email pair
        const groups = [];
        for (const c of commits) {
            const sha = c.sha.slice(0, 7);
            const key = `${c.commit.author.email}|${c.commit.committer.email}`;
            const existing = groups.find(g => g.key === key);
            if (existing) existing.shas.push(sha);
            else groups.push({ key, author: c.commit.author, committer: c.commit.committer, shas: [sha] });
        }

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns:max-content max-content 1fr; gap:4px 16px; align-items:baseline; margin-top:4px;';
        frag.appendChild(grid);

        for (const { author, committer, shas } of groups) {
            const cell = (label, person) => {
                const d = document.createElement('div');
                d.style.whiteSpace = 'nowrap';
                d.append(label + ': ', userLink(person));
                return d;
            };
            const shaDiv = document.createElement('div');
            shaDiv.style.wordBreak = 'break-word';
            shaDiv.append('Commit(s): ');
            shas.forEach((sha, i) => {
                if (i) shaDiv.append(', ');
                const code = document.createElement('code');
                code.textContent = sha;
                shaDiv.appendChild(code);
            });
            grid.append(cell('Author', author), cell('Committer', committer), shaDiv);
        }

        injectResult(frag);

        // Fetch PR opener info asynchronously
        if (pull_id != null) {
            api(`/repos/reactos/${pull_repo}/pulls/${pull_id}`)
                .then(pr => pr?.user?.url && api(pr.user.url.replace('https://api.github.com', '')))
                .then(u => {
                    const el = document.getElementById('lm_gh_pr_opener')?.querySelector('span') ?? prUserSpan;
                    if (!el) return;
                    if (u?.login) {
                        const a = document.createElement('a');
                        a.href = u.html_url;
                        a.textContent = u.name || u.login;
                        el.replaceWith(a);
                    } else {
                        el.style.color = 'red';
                        el.textContent = 'User not found';
                    }
                })
                .catch(() => {});
        }
    }

    function errorSpan(msg) {
        const s = document.createElement('span');
        s.style.color = 'red';
        s.textContent = msg;
        return s;
    }

    async function checkCommitters() {
        document.getElementById('lm_gh_result')?.remove();
        const path = window.location.pathname;

        const prMatch = path.match(/reactos\/(.*?)\/pull\/(\d+)/);
        if (prMatch) {
            const data = await api(`/repos/reactos/${prMatch[1]}/pulls/${prMatch[2]}/commits`);
            if (data.message === 'Not Found') injectResult(errorSpan('PR not found'));
            else buildCommitInfo(data, prMatch[2], prMatch[1]);
            return;
        }

        const commitMatch = path.match(/reactos\/commit\/([0-9a-f]+)/);
        if (commitMatch) {
            const data = await api(`/repos/reactos/reactos/commits/${commitMatch[1]}`);
            if (data.message === 'Not Found') injectResult(errorSpan('Commit not found'));
            else buildCommitInfo([data]);
        }
    }

    checkCommitters();
    document.addEventListener('turbo:load',   checkCommitters);
    document.addEventListener('turbo:render', checkCommitters);

    const _push = history.pushState.bind(history);
    history.pushState = (...args) => { _push(...args); setTimeout(checkCommitters, 250); };
})();
