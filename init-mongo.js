// init-mongo.js

db = db.getSiblingDB('scraper_app');

db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [{ role: 'readWrite', db: 'scraper_app' }],
});
