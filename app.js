//modules :: make it possible to include other JS files and external libraries to our app
var express = require('express'),
	app = express(),
	expressSession = require('express-session'),
	http = require('http'),
	server = http.createServer(app),
	path = require('path'),
	url = require('url'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser');

//fortonoume kai sindeomaste stin vasi
mongoose.connect('mongodb://localhost/geografiadb');
mongoose.set('debug, true');

//models [stin ousia einai klaseis]
var User = require('./models/user.js');
var Test = require('./models/test.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('less-middleware')(path.join(__dirname, '/public')));
app.use(expressSession({secret:"Shhhhh"}));
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({'extended':true}));
// parse application/json
app.use(bodyParser.json());

//enarksi apodoxis sindeseon sto port 8000
server.listen(8000);
console.log('Up and running!');

/*
* The request is used to determine what should be done
* The response allows us to write output back to the client
*/

// to app.get trexei otan anoiksoume ti selida epeidi o browser kathe fora kanei get request
// me to app.post o browser kanei to post request stin idia selida, 
// kai stelnei + ta dedomena tis formas otan patiseis submit 

//H selida gia to register
app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){
	// an exoun simplirothei ola ta stoixeia kai o repeated password einai idios me ton arxiko
	if(
		typeof req.body.firstName!==undefined
		&& typeof req.body.lastName!==undefined
		&& typeof req.body.AM!==undefined
		&& typeof req.body.password!==undefined
		&& typeof req.body.password2!==undefined
		&& req.body.password==req.body.password2 
	){
		// tote ftiakse ena kainourio antikeimeno me auta ta stoixeia
		var newUser = {
			'firstName': 	req.body.firstName,
			'lastName': 	req.body.lastName,
			'AM': 			req.body.AM,
			'password': 	req.body.password		
		};
		var user=new User(newUser);

		// dimiourgisame ena antikeimeno me onoma user tipou User 
		// me ta stoixeia tou newUser pou perasan me to register

		// kataxorisi tou user stin vasi me tin methodo save:
		user.save(function(err, user){		
			// an o xristis iparxei tote pairnoume to id tou pou einai stin vasi 
			// kai to thetoume os to userID tou sigkekrimenou session
			// etsi oste na ton tautopoioume
			if( user !== undefined ) {				 
				req.session.userID=user._id;		
				res.redirect('/');					 
			} else {
				console.log('ERROR! :-)');
				res.render('register');
			}
		});
	} 
	else{
		res.render('register');
	}
});

//H selida gia to login
app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', function(req, res){
	if(	typeof req.body.AM!==undefined && typeof req.body.password!==undefined ){ 	
		// an ta AM kai password den einai kena, tote kane to query:
		// psakse gia to AM kai ton kodiko tou user stin vasi dedomenon
		User.findOne({'AM':req.body.AM, 'password':req.body.password}, '_id', function(err, user){
			// an vrethei o xristis tote krata to id tou gia to session kai girna sto dashboard
			// allios girna sto login page
			if( user !== null ) {
				req.session.userID=user._id;		
				res.redirect('/');					
			} else {
				res.render('login');				
			}
		});
	} 
	else{
		res.render('login');
	}
});

//H selida gia to logout diagrafei to session
app.get('/logout', function( req, res ){
	req.session.destroy();	
	res.redirect('/login');
});

//H selida gia to dashboard
app.get('/', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var statistics = {};
		var categories = ['capitals','countries','continents','mountains','rivers'];
		var total_tests = 0;
		var total_correct_answers = 0;
		for( var i in categories ) {
			// gia kathe katigoria, an ta tests_done tou xristi den einai 0
			// tote prosthese ton arithmo ton tests sta sinolika tests
			// kai tis sostes tou apantiseis stis sinolikes sostes apantiseis
			// kai ipologise ta statistika tous
			if( user.categories[categories[i]].tests_done != '0' ) {
				total_tests += user.categories[categories[i]].tests_done;
				total_correct_answers += user.categories[categories[i]].correct_answers;
				var correct_answers = user.categories[categories[i]].correct_answers;
				var tests_done = user.categories[categories[i]].tests_done;
				statistics[categories[i]] = ((correct_answers / tests_done) * 100).toFixed(1) + '%';
			} else {
				statistics[categories[i]] = 'You haven\'t done any tests in this category.';
			}
		}
		//ipologismos tou posostou gia tis epanaliptikes erotiseis
		if( total_tests){
			var total_percentage = ((total_correct_answers / total_tests) * 100).toFixed(1) + '%';
		} else {
			var total_percentage = 'You haven\'t done any tests.';
		}

		// ta data pou stelnei i selida
		var data = {
			'section': 			'dashboard',
			'name': 			user.firstName,
			'lastname': 		user.lastName,
			'statistics': 		statistics,
			'total_percentage': total_percentage
		};

		res.render('dashboard', data);
	});
});


//H selida gia to theory
app.get('/theory', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory', data);
	});
});

//H selida gia to theory intro
app.get('/theory/intro', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory_intro', data);
	});
});

//H selida gia to theory_continents
app.get('/theory/continents', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory_continents', data);
	});
});


//H selida gia to theory_countries_and_capitals
app.get('/theory/countries-and-capitals', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory_countries_and_capitals', data);
	});
});


//H selida gia to theory_mountains
app.get('/theory/mountains', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory_mountains', data);
	});
});

//H selida gia to theory_rivers
app.get('/theory/rivers', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section'	: 'theory'
		};
		res.render('theory_rivers', data);
	});
});

//H selida gia ta tests
app.get('/tests/:category?', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		if( typeof req.params.category !== 'undefined' ) {
			// an oi katigories einai orismenes,
			// kai den einai to revision, tote pare erotiseis apo tin katigoria pou epilexthike
			// an einai to revision, tote pare erotiseis apo oles tis katigories
			if( req.params.category !== 'revision' ) {
				var where = {'category': req.params.category};
			} else {
				var where = {};
			}

			//query: ferne erotiseis 8 fores, i mexri na teleiosoun oi erotiseis
			// [gia paradeigma se periptosi pou zitithoun 20 erotiseis eno iparxoun mono 10
			// na min crusharei o kodikas]
			Test.find(
				where,
				'_id text choices',
				function(err, db_tests) {
					
					var tests_per_page = 8;
					var counter = 0;
					var tests = [];
					while( counter < tests_per_page && counter < db_tests.length ) {
						var current_test = db_tests.splice( ~~( Math.random() * db_tests.length ), 1 )[0];
						tests.push( current_test );
						counter++;
					}
					
					var data = {
						'section'	: 'tests',
						'tests'		: tests
					};
					res.render('test', data);
				}
			);
		} else {
			var data = {
				'section': 'tests'
			};
			res.render('tests', data);
		}
	});
});

//To zoumi
app.post('/tests/:category', function(req,res){
	if_logged_in( req, res, function( user ) {
		var test_ids = [];
		for( var key in req.body ) {
			test_ids.push( key );
		}

		Test.find().where('_id').in( test_ids ).exec( function( err, tests ){
			var right_choices_count = 0;
			var choices_per_category = {};

			// gia ola ta question_key kai gia kathe answer_key
			// an tautopoieitai i erotisi
			// ?? kai den vriskei tin XXXXx tote tests_done: 1
			// allios auksise ta tests_done kata 1
			// an i apantisi einai sosti
			// tote auksise tis sostes apantiseis stin katigoria
			// kai tis sinolikes sostes apantiseis tou xristi [gia to sinoliko pososto]
			// kai min psaxneis gia alles erotiseis
			for( var question_key in req.body ) {
				for( var answer_key in tests ) {
					if( tests[answer_key]._id == question_key ) {
						if( typeof choices_per_category[tests[answer_key].category] == 'undefined' ) {
							choices_per_category[tests[answer_key].category] = {
								correct_answers: 0,
								tests_done: 1
							};
						} else {
							choices_per_category[tests[answer_key].category].tests_done++;
						}
						if( req.body[question_key] == tests[answer_key].right_choice ) {
							choices_per_category[tests[answer_key].category].correct_answers++;
							right_choices_count++;
						}
						break;
					}
				}
			}

			//update tou user stin vasi kai metafora sti selida ton apotelesmaton
			var where = { '_id': user._id };
			var update = {
				'$inc': {}
			};
			for( var key in choices_per_category ) {
				update['$inc']['categories.' + key + '.tests_done' ] = choices_per_category[key].tests_done;
				update['$inc']['categories.' + key + '.correct_answers' ] = choices_per_category[key].correct_answers;
			}
			User.update( where, update, function() {
				res.redirect('/results/?category='+req.params.category+'&tests_done=8&correct_answers='+right_choices_count);
			});

		});
	});
});

//H selida gia ta apotelesmata
app.get('/results', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var tests_done = req.query.tests_done;
		var correct_answers = req.query.correct_answers;
		var category = req.query.category;
		var needs_revision=false;

		if ( correct_answers/tests_done<0.5 ){
			needs_revision=true;
		}

		var data = {
			'section': 'tests',
			'tests_done': tests_done,
			'correct_answers': correct_answers,
			'needs_revision': needs_revision,
			'category': category
		};

		res.render('results', data);
	});
});

//H selida gia to about
app.get('/about', function( req, res ) {
	if_logged_in( req, res, function( user ) {
		var data = {
			'section': 'about'
		};

		res.render('about', data);
	});			
});


//H diadikasia pou elegxei an einai logged in o user
function if_logged_in( req, res, callback ) {
	if (req.session.userID){
		// query: an tautopoiithei to session.userID me to id pou exei o user stin vasi
		// tote fere ola ta stoixeia tou user kai ektelese ton ekastote kodika kathe selidas me to callback
		// allios ksanagirna sto login page
		User.findOne({'_id':req.session.userID}, '_id firstName lastName AM categories', function(err, user){
			if( user !== null ) {
				callback( user );
			} else {
				res.redirect('/login');	
			}
		});
	}
	else {
		res.redirect('/login');	
	}
}

//H krifi selida gia ta tests ;) **EKTELESI PRIN ARXISEI TO SITE GIA NA FORTOSOUN OI EROTISEIS**
app.get('/generate_tests', function( req, res ) {
	Test.collection.remove( function() {
		var test_bundle = [];
		/* CAPITALS --------------------------------------------------------------------------------*/
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Greece?',
			'choices': ['Athens','Milan','Berlin'],
			'right_choice': 'Athens',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Argentina?',
			'choices': ['Rio de Janeiro','Santiago','Buenos Aires'],
			'right_choice': 'Buenos Aires',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Spain?',
			'choices': ['Madrid','Santiago','Buenos Aires'],
			'right_choice': 'Madrid',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Italy?',
			'choices': ['Rio de Janeiro','Rome','Buenos Aires'],
			'right_choice': 'Milan',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Canada?',
			'choices': ['Toronto','Ottawa','Mississipi'],
			'right_choice': 'Ottawa',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Germany?',
			'choices': ['Monaco','London','Berlin'],
			'right_choice': 'Berlin',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Poland?',
			'choices': ['Krakow','Minsk','Warsaw'],
			'right_choice': 'Warsaw',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Russia?',
			'choices': ['Tallinn','Moscow','Saint Petersburg'],
			'right_choice': 'Moscow',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of France?',
			'choices': ['Athens','Lyon','Paris'],
			'right_choice': 'Paris',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Portugal?',
			'choices': ['Lisbon','Barcelona','Porto'],
			'right_choice': 'Lisbon',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Algeria?',
			'choices': ['Cairo','Tripoli','Algiers'],
			'right_choice': 'Algiers',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of India?',
			'choices': ['Islamabad','Kabul','New Delhi'],
			'right_choice': 'New Delhi',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Peoples Republic of China?',
			'choices': ['Shanghai','Beijing','Tianjin'],
			'right_choice': 'Beijing',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Thailand?',
			'choices': ['Bangkok','Yangon','Hanoi'],
			'right_choice': 'Bangkok',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Australia?',
			'choices': ['Canberra','Sydney','Melbourne'],
			'right_choice': 'Canberra',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Angola?',
			'choices': ['Lusaka','Gabon','Luanda'],
			'right_choice': 'Luanda',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Kenya?',
			'choices': ['Kampala','Brazzaville','Nairobi'],
			'right_choice': 'Nairobi',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Latvia?',
			'choices': ['Sarajevo','Riga','Prague'],
			'right_choice': 'Riga',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Bolivia?',
			'choices': ['Bogota','Sucre','Arica'],
			'right_choice': 'Sucre',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Algeria?',
			'choices': ['Cairo','Tripoli','Algiers'],
			'right_choice': 'Algiers',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Venezuela?',
			'choices': ['Caracas','Valencia','Sao Paulo'],
			'right_choice': 'Caracas',
			'category': 'capitals'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the capital of Ethiopia?',
			'choices': ['Adis Ababa','Kuala Lumpur','Doha'],
			'right_choice': 'Adis Ababa',
			'category': 'capitals'		
		};

		/* MOUNTAINS ------------------------------------------------------------------------------*/
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mount Everest?',
			'choices': ['Chile','Tibet','Norway'],
			'right_choice': 'Tibet',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mt. Pico Bolivar?',
			'choices': ['Peru','Venezuela','Chile'],
			'right_choice': 'Venezuela',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mt. Ras Dashen?',
			'choices': ['Ethiopia','Egypt','Sudan'],
			'right_choice': 'Ethiopia',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mt. Volcan Tajumulco?',
			'choices': ['Honduras','El Salvador','Guatemala'],
			'right_choice': 'Guatemala',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'In which state of the USA Mount Rainier is located?',
			'choices': ['Washington','Montana','North Dakota'],
			'right_choice': 'Washington',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Mountain K2 is in the borders between China and which country?',
			'choices': ['Pakistan','India','Nepal'],
			'right_choice': 'Pakistan',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mount Kinabalu?',
			'choices': ['Indonesia','Malaysia','Philippines'],
			'right_choice': 'Indonesia',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mauna Kea?',
			'choices': ['Hawaii','Easter Islands','Ireland'],
			'right_choice': 'Hawaii',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the mountain Bogda Peak?',
			'choices': ['China','Peru','Austria'],
			'right_choice': 'China',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Nanga Parbat?',
			'choices': ['Tibet','Afghanistan','Pakistan'],
			'right_choice': 'Pakistan',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Mountain Chimborazo?',
			'choices': ['Chile','Ecuador','Mexico'],
			'right_choice': 'Ecuador',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Mount Damavand?',
			'choices': ['Iran','Irak','Turkey'],
			'right_choice': 'Iran',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'In which mountain range does Mont Blanc belong?',
			'choices': ['The Himalayas','Alps','Andes'],
			'right_choice': 'Alps',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the longest mountain range?',
			'choices': ['The Himalayas','Alps','Andes'],
			'right_choice': 'Andes',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the highest Mountain in Earth?',
			'choices': ['Mount Everest','Aconcagua Mountain','Mont Blanc'],
			'right_choice': 'Mount Everest',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Caucasus most close to?',
			'choices': ['Russia','Peru','Australia'],
			'right_choice': 'Russia',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Vinson Massif located?',
			'choices': ['Alaska','Antarctika','South Africa'],
			'right_choice': 'Antarctika',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Pico de Orizaba?',
			'choices': ['Ecuador','Peru','Mexico'],
			'right_choice': 'Mexico',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the tip of Mount Kilimanjaro?',
			'choices': ['Tanzania','Madagascar','Ghana'],
			'right_choice': 'Tanzania',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Mount Logan?',
			'choices': ['Brazil','Canada','USA'],
			'right_choice': 'Canada',
			'category': 'mountains'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Mount McKinley?',
			'choices': ['Argentina','Alaska','Antarctika'],
			'right_choice': 'Canada',
			'category': 'mountains'		
		};

		/* COUNTRIES -----------------------------------------------------------------------------------*/
		test_bundle[test_bundle.length] = {
			'text': 'Where is Egypt?',
			'choices': ['North America','Europe','Africa'],
			'right_choice': 'Africa',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which country is crossed by the Dunabe River?',
			'choices': ['Czech Republic','Hungary','Greece'],
			'right_choice': 'Hungary',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Sofia?',
			'choices': ['Bulgaria','Hungary','Greece'],
			'right_choice': 'Bulgaria',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Zagreb?',
			'choices': ['Croatia','Romania','Slovakia'],
			'right_choice': 'Croatia',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Stockholm?',
			'choices': ['Sweden','Denmark','Netherlands'],
			'right_choice': 'Sweden',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Bristol?',
			'choices': ['England','Ireland','Scotland'],
			'right_choice': 'Bulgaria',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Berne?',
			'choices': ['Switzerland','Austria','Germany'],
			'right_choice': 'Switzerland',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Bratislava?',
			'choices': ['Slovenia','Hungary','Slovakia'],
			'right_choice': 'Hungary',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which country does Austria not border with?',
			'choices': ['Switzerland','Poland','Italy'],
			'right_choice': 'Poland',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which country does not belong to the Nordic countries?',
			'choices': ['Denmark','Norway','Estonia'],
			'right_choice': 'Estonia',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Gibraltar located?',
			'choices': ['Portugal','Spain','Morocco'],
			'right_choice': 'Spain',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Lake Malawi?',
			'choices': ['South Africa','North Africa','South America'],
			'right_choice': 'South Africa',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Lake Tanganyika?',
			'choices': ['South America','South Africa','South Asia'],
			'right_choice': 'South Africa',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Laos?',
			'choices': ['South Africa','South Asia','Australia'],
			'right_choice': 'South Asia',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Reykjavik?',
			'choices': ['Ireland','Iceland','Alaska'],
			'right_choice': 'Iceland',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'In which state of the USA is Atlandic City located?',
			'choices': ['New Jersey','Virginia','Pennsylvenia'],
			'right_choice': 'New Jersey',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'In which state of the USA is Dallas located?',
			'choices': ['Oklahoma','Arkasas','Texas'],
			'right_choice': 'Texas',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Belgrade?',
			'choices': ['Bosnia and Herzegovina','Hungary','Serbia'],
			'right_choice': 'Serbia',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Odessa?',
			'choices': ['Ukraine','Belarus','Moldova'],
			'right_choice': 'Ukraine',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Vilnius?',
			'choices': ['Latvia','Malta','Lithuania'],
			'right_choice': 'Lithuania',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Gdynia?',
			'choices': ['Czech Republic','Poland','Netherlands'],
			'right_choice': 'Poland',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Vienna?',
			'choices': ['Italy','Austria','Germany'],
			'right_choice': 'Austria',
			'category': 'countries'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Venice?',
			'choices': ['Spain','France','Italy'],
			'right_choice': 'Italy',
			'category': 'countries'		
		};

		/* RIVERS ----------------------------------------------------------------------------------------------*/
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Yangtze River?',
			'choices': ['Germany','Canada','China'],
			'right_choice': 'China',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which of the following countries is crossed by the Dunabe River?',
			'choices': ['Czech Republic','Hungary','Greece'],
			'right_choice': 'Hungary',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Oder River?',
			'choices': ['Germany','Poland','France'],
			'right_choice': 'Poland',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Vistula River?',
			'choices': ['Germany','Lithuania','Poland'],
			'right_choice': 'Poland',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Volga River?',
			'choices': ['Belgium','Canada','Russia'],
			'right_choice': 'Russia',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Rhine River formed?',
			'choices': ['France','Switzerland','Italy'],
			'right_choice': 'Switzerland',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Tagus River formed?',
			'choices': ['Spain','France','England'],
			'right_choice': 'Spain',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Thames River?',
			'choices': ['England','Canada','USA'],
			'right_choice': 'England',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Don River formed?',
			'choices': ['Russia','Canada','China'],
			'right_choice': 'Russia',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the longest river on Earth?',
			'choices': ['Amazon','Mississippi','Nile'],
			'right_choice': 'Nile',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Nile River?',
			'choices': ['Africa','South America','China'],
			'right_choice': 'Africa',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Amazon River?',
			'choices': ['South America','Africa','Asia'],
			'right_choice': 'South America',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the largest river on Earth?',
			'choices': ['Amazon','Nile','Yangtze'],
			'right_choice': 'Amazon',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Mississippi River?',
			'choices': ['South America','North America','Europe'],
			'right_choice': 'North America',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Yenisei River formed?',
			'choices': ['Mongolia','India','China'],
			'right_choice': 'Mongolia',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Yellow River?',
			'choices': ['Hungary','Canada','China'],
			'right_choice': 'China',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Ob River?',
			'choices': ['North America','Canada','Russia'],
			'right_choice': 'Russia',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is the Yangtze River?',
			'choices': ['Germany','Canada','China'],
			'right_choice': 'China',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which country is not crossed by the Parana River?',
			'choices': ['Paraguay','Argentina','Uruguay'],
			'right_choice': 'Uruguay',
			'category': 'rivers'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Which is the deepest river on Earth?',
			'choices': ['Congo','Amazon','Yellow'],
			'right_choice': 'Congo',
			'category': 'rivers'		
		};
		/*CONTINENTS -----------------------------------------------------------------------------------------*/
		test_bundle[test_bundle.length] = {
			'text': 'Where is Tanzania?',
			'choices': ['Africa','North America','Australia'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Tanzania?',
			'choices': ['Africa','North America','Australia'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Tasmania?',
			'choices': ['Africa','North America','Australia'],
			'right_choice': 'Australia',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Madagascar?',
			'choices': ['Africa','Asia','Australia'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Iceland?',
			'choices': ['Europe','North America','Antarctika'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Indonesia?',
			'choices': ['Africa','Asia','Australia'],
			'right_choice': 'Asia',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Malta?',
			'choices': ['Africa','Europe','Asia'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Cuba?',
			'choices': ['South America','North America','Asia'],
			'right_choice': 'North America',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Haiti?',
			'choices': ['Africa','North America','Australia'],
			'right_choice': 'North America',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Puerto Rico?',
			'choices': ['Africa','Europe','North America'],
			'right_choice': 'North America',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where are The Bahamas?',
			'choices': ['North America','Africa','Europe'],
			'right_choice': 'North America',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Hawaii?',
			'choices': ['North America','Asia','Australia'],
			'right_choice': 'North America',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where are the Faroe Islands?',
			'choices': ['Africa','Europe','Australia'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where are the Canary Islands?',
			'choices': ['Europe','Africa','Australia'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Papua New Guinea?',
			'choices': ['Africa','Asia','Australia'],
			'right_choice': 'Australia',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Guinea?',
			'choices': ['Africa','Europe','Australia'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Sierra Leone?',
			'choices': ['Europe','South America','Africa'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Cameroon?',
			'choices': ['Asia','South America','Africa'],
			'right_choice': 'Africa',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Sicily?',
			'choices': ['Africa','Europe','Asia'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};
		test_bundle[test_bundle.length] = {
			'text': 'Where is Cyprus?',
			'choices': ['Africa','Europe','Asia'],
			'right_choice': 'Europe',
			'category': 'continents'		
		};

		Test.create( test_bundle, function(err) {
			res.send('Ok.');
		});
	});
});

