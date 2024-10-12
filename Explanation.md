### The problem to be solved in your own words.

The task to build a Node.js app to scrap job postings from different website and save the summary it db to retrieve it later.


### A technical specification of your design 

* the app is built using Nest.js framework
* the app is divided into 1 module: job-posting.
* I used Puppeteer for scraping the job postings.
* I used MongoDB for storing the job postings.
* I used MongoDB ChatGPT to generate the summary of the job posting.
* I used Swagger for API documentation.
* Github actions for CI/CD.

### how it works.


  * POST /job-posting: to scrap the job posting from the website, clean the job from unnecessary tags, send it to chatgpt, get the summary,save it and save it to the db.
