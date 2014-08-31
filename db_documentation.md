Mongo db
========

Relational db -> Joins
NoSQL db -> no joins

Schemata that try to avoid joins


User schema
-----------

_id | first_name | last_name | am | password | categories [ category {tests_done, correct_answers} ]


Test schema
-----------

_id | text | choices [choice_text] | right_choice | category



Categories example

Categories: {
	capitals: {
		tests_done: 124,
		correct_answers: 5
	},
	continents: {
		tests_done: 111,
		correct_answers: 85
	},
	countries: {
		tests_done: 111,
		correct_answers: 85
	},
	mountains: {
		tests_done: 111,
		correct_answers: 85
	},
	rivers: {
		tests_done: 91,
		correct_answers: 85
	}
}

choices: [
	0: 'Moscow',
	1: 'Budapest',
	2: 'Vienna'
],
right_choice: 'Vienna'