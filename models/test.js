var mongoose=require('mongoose');
var db=mongoose.connection;
var testSchema=mongoose.Schema({
	text: {type:String, required:true},
	choices: [{type:String, required:true}],
	right_choice: {type:String, required:true},
	category: {type:String, required:true}	
});

var Test=mongoose.model('Test',testSchema);
module.exports=Test;