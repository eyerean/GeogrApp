
##############################
#                            #
#     "GeogrApp" project     #
#                            #
##############################

Note: In order to run GeogrApp on your localhost, the node.js platform is required. 
I recommend running it on Linux OS.

# Installation guide and prerequisites #

	# For Linux systems:

1. sudo apt-get update
2. download and install node.js from http://nodejs.org/
3. sudo apt-get install npm
4. cd to the geography directory
5. sudo npm install
6. download and install mongoDB from http://www.mongodb.org/downloads
7. node app.js		// to run the server
8. You should see "Up and running!" on your console. If not, type in terminal: nodejs app.js
9. localhost:8000/generate_tests		// on your browser
10. localhost:8000


 # For Windows systems:

1. download and install node.js from http://nodejs.org/
2. download and install mongoDB from http://www.mongodb.org/downloads
3. run on cmd: npm install
4. allow access to that application through the Windows Firewall:

    Advanced settings of a Windows Firewall: "Control Panel > System Ecurity > Windows Firewall > Advanced Settings".
    Create new rule.
    Select "Port" and press "Next".
    Allow TCP and port your are attempting to expose (default 3000, you might want to expose 80), and press "Next".
    Select "Allow the connection" and press "Next".
    Check all: Domain, Private, Public and press "Next".
    Type "Acne Challenge Server" as name, and press "Done".

5. restart OS
6. run on cmd: "node app" from within geography directory
7. localhost:8000/generate_tests		// on your browser
8. localhost:8000

# MongoDB Database Info #

To access the mongoDB database created for the project, in Linux systems type in terminal:

1. mongo
2. use geografiadb
3. db.users.find()		// for the users schema
4. db.tests.find()		// for the tests schema


# Project Info # 

The GeogrApp project was written completely in JavaScript, in the node.js server, using the express.js framework, the Jade template engine,
the Less css pre-processor, the Bootstrap framework, and the mongoDB open-source database, among with mongoose.js library.

All code written, compiled, tested, run by Irene Pappa [Ειρήνη Παππά]:

AM: P10100
Course: Educational Software
Semester: 8th
Professor: Virvou M.
Lecturer: Alepis E.
Piraeus, July 2014




