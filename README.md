kiva-app
========

Node.js app with a MySQL database. 

I added a button in the bottom right corner of the page which saves the current set of loans to a MySQL database that I set up using my schema.

The 'My Api' link in the top right of the page takes you to my implementation of the newestloans api which runs queries on my db, and should return similar results to the kiva api.

Style courtesy of jquery smoothness theme and datatables.net.

Logo courtesy of Kiva.

I set up a aws ec2 instance running my app for you to view, I would've used heroku but it was easier just to install mysql on ec2 than to try and figure out how to use ClearDB.
http://ec2-54-213-0-58.us-west-2.compute.amazonaws.com:8080/

