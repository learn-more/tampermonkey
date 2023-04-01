# Various tampermonkey scripts

Install them by clicking on the script title you want, and then clicking the 'install' button in the tampermonkey page that should open.

## ['Old New Thing' link fixup](../../raw/master/old-new-thing.user.js)
* Fix links on [The Old New Thing](https://devblogs.microsoft.com/oldnewthing/)
* Display the original links

![Example](https://raw.githubusercontent.com/learn-more/tampermonkey/master/img/old-new-thing.png "Example")


## [Github improvements](../../raw/master/github-pr-author.user.js)

* Show commits, grouped by author + committer
* Add links for easy patchbot submission (Also needs `patchbot-fill.user.js`)
* Show 'known' email addresses for listed users
* Show 'mismatching' email addresses for listed users
* Show PR author
* Use github api key (Doubleclick the overlay)

![Example](https://raw.githubusercontent.com/learn-more/tampermonkey/master/img/github-pr-author.png "Example")


## [Jira patchbot links on attachments](../../raw/master/jira-patchbot-links.user.js)

* Add links to attachments for easy patchbot submission (Also needs `patchbot-fill.user.js`)

![Example](https://raw.githubusercontent.com/learn-more/tampermonkey/master/img/jira-patchbot-links.png "Example")


## [Patchbot fill in values](../../raw/master/patchbot-fill.user.js)

* Script accompanying `github-pr-author.js` and `jira-patchbot-links.user.js` to actually fill in the values from the patchbot submission


## [Mailman threaded view extension](../../raw/master/mailman-inline.user.js)

* Add option to threaded views to expand posts inline

![Example](https://raw.githubusercontent.com/learn-more/tampermonkey/master/img/mailman-inline.png "Example")
