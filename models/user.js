var mongoose=require('mongoose');
var db=mongoose.connection;
var userSchema=mongoose.Schema({
	firstName: {type:String, required:true},
	lastName: {type:String, required:true},
	AM: {type:String, required:true, unique:true},
	password: {type:String, required:true},
	categories: {
		capitals: {
			tests_done:{type:Number, default:0},
			correct_answers:{type:Number, default:0}
		},
		countries: {
			tests_done:{type:Number, default:0},
			correct_answers:{type:Number, default:0}
		},
		continents: {
			tests_done:{type:Number, default:0},
			correct_answers:{type:Number, default:0}
		},
		mountains: {
			tests_done:{type:Number, default:0},
			correct_answers:{type:Number, default:0}
		},
		rivers: {
			tests_done:{type:Number, default:0},
			correct_answers:{type:Number, default:0}
		}
	}
});

var User=mongoose.model('User',userSchema);
module.exports=User;