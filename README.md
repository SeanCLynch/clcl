## :heavy_check_mark: Checklisting.Club, collaborative preparedness

> Checklisting enables you to safely and collaboratively manage any situation, from mundane to mission-critical.

Extreme complexity makes it easy to overlook routine matters during pressing circumstances (and moments of forgetfulness!). Formalizing these steps into a well-formatted series of actions, and making it easily accessible in all situations, are the key components of a good checklist.

A good checklist, with the proper team culture, can dramatically reduce the damage of careless, trivial errors in a project. Checklists have been used in aviation, construction, surgery, and more with outstanding results.

> For skilled workers and managers who need safety during crucial and complex processes, Checklisting.Club is a website that provides a collaborative and systematic set of tools to provide preparedness and peace of mind.

Unlike a surgeon forgetting to wash his hands | a pilot panicking in a storm | a security guard wandering aimlessly | etc., Checklisting.Club provides a collaborative action plan for any situation. 


## Examples / Who is this for?

* Pilots managing uncommon situations.
* Doctors performing routine procedures.
* Chefs following cleaning standards.
* Engineers building secure infrastructure.
* Designers creating accessible interfaces.
* Data scientists debugging models.
* IT administrators setting up a new server.
* Software developers learning version control.
* Police officers, machinists, teachers, nurses, and more...


## Background: 
* The Checklist Manifesto - Atul Gawande
* Github.com


## Features:
* Easily create checklists. Duh.
* Automatically (and optionally!) scan your checklist for best practices (e.g. number of items, simple wording, do-confirm vs read-do, etc).
* Beautifully format your checklist for printing using the power of Latex.
* Update, change and revise checklists with the community, based on real-world experiences.
* Or optionally create private checklists for secret things.
* Subscribe to curated articles on embracing a culture of teamwork and professional discipline.


## Getting Started

* Install NodeJS
* Install Redis.


## Useful Commands/Scripts/Spells

* `redis-server` - start redis server.
* `npm run seed` - seed db with sample lists. 
* `npm start`    - start express server.
* Visit `localhost:4001/` and enjoy!
* Can run `redis-commander` and visit `localhost:8081/` for GUI.

## Contributors:
* Seanclynch


## Notes:

__Best Practices:__
* killer items/stupid mistakes: only the most critical/important steps.
* keep it short: ~5-9 items recomended, single sheet of paper.
* easy to read: sans-serif, upper/lower case, avoid colors or graphics.
* authorize a reader: assign specific team member to initiate checklist use.
* Two main types of checklists: DO-CONFIRM and READ-DO


__Examples of uses:__
* https://news.ycombinator.com/item?id=17358088 - excellent
* https://news.ycombinator.com/item?id=19682451 - excellent
* https://news.ycombinator.com/item?id=20626500 - on shortcomings
* https://news.ycombinator.com/item?id=20293246
* https://news.ycombinator.com/item?id=20495739
* https://news.ycombinator.com/item?id=19949952
* https://news.ycombinator.com/item?id=19682451
* https://news.ycombinator.com/item?id=19849787
* https://news.ycombinator.com/item?id=19857969
* https://news.ycombinator.com/item?id=16956899
* https://news.ycombinator.com/item?id=18386252
* https://news.ycombinator.com/item?id=19032180
* https://news.ycombinator.com/item?id=16987210
* https://news.ycombinator.com/item?id=17007548
* https://github.com/shieldfy/API-Security-Checklist
* https://github.com/Hack-with-Github/Awesome-Hacking
* https://github.com/GitGuardian/APISecurityBestPractices/blob/master/Leak%20Mitigation%20Checklist.md
* https://www.owasp.org/index.php/OWASP_Cheat_Sheet_Series
* https://www.owasp.org/images/7/72/OWASP_Top_10-2017_(en).pdf.pdf
* https://www.producthunt.com/posts/front-end-design-checklist
* https://jdow.io/blog/2018/03/18/web-application-penetration-testing-methodology/#osint-harvesting
* https://zeltser.com/cheat-sheets/
* https://www.nasa.gov/sites/default/files/atoms/files/nasa_systems_engineering_handbook.pdf
* https://ecomply.io/product/
* https://www.sideprojectchecklist.com/marketing-checklist/
* https://www.indiehackers.com/@robhope/a-checklist-to-help-green-light-your-next-idea-bbd6ae1bcd
* https://securitycheckli.st/
* https://24ways.org/2018/securing-your-site-like-its-1999/
* https://www.nature.com/news/hospital-checklists-are-meant-to-save-lives-so-why-do-they-often-fail-1.18057 


__Traction Channels:__
* Viral Marketing using collaboration, embedded.
* Search Engine Marketing/Optimization.
* Content Marketing.
* Community Building.


__Competitors (?):__
* https://process.st/
* https://www.forgett.com/
* https://cleverchecklist.com/
* https://devchecklists.com/
* https://ch.ckl.st/home

# Current Tasks: 

MVP Requirements:

For Lists:
TODO: Add basic export mechanisms.
TODO: Add username/listname blacklist. Disallow spaces. Disallow tmp-forks username. Disallow Redis Cmds.

For DevOps:
TODO: Determine efficient deployment process (heroku, pm2, etc).
TODO: Update license.
TODO: Audit basic security measures.
TODO: Add backup/persistance to redis.

For Monitoring:
TODO: Add usage statistics. Add "stats" hash, that is inc/dec on adds/deletes (faster than KEYS or SCAN).
TODO: Add roadmap. 

For Marketing:
TODO: Landing page should be mobile-ready.
TODO: Add legit checklist examples x10
TODO: Share with various groups.

---

FOR LATER:
TODO: Show time remaining on tmp-forks.
TODO: Improve randomization & iterating.
TODO: Forgot password.
