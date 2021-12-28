var mysql = require('mysql');
var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'saksglobal_db'
});
connection.connect(function(error){
	if(!!error) {
        console.log("Database connection Error");
		console.log(error);
	} else {
        console.log('Database successfully Connected');
	}
});

module.exports = connection;

