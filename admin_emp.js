var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();




var mySqlClient = mysql.createConnection({
    host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user : 'root',
  password: '12121212',
  database: 'dbTeam'
});


app.listen(3300, function (){
    console.log('Example app listening on port 3300!');
}); 



mySqlClient.connect(function (err){
    if(err){
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('Success DB connection');
});

app.get( '/', function(req, res){
	
	fs.readFile('emp_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from employee', function(error, results){
				if(error){
					console.log('error : ', error.message);
				}else{
					res.send( ejs.render(data, {
						prodList : results
					}));
				}
			});
		}
	})
});

app.get('/delete/:emp_id', function(req, res){
	mySqlClient.query('delete from employee where emp_id = ?', [req.params.emp_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete emp_id = %s', req.params.emp_id);
					res.redirect('/');				
				}
			});
});

app.get('/emp_insert', function(req, res){
	fs.readFile('emp_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

//app.get( '/edit/:emp_id', function(req, res){
//	fs.readFile( 'edit.html', 'utf8', function(error, data){
//		mySqlClient.query('select * from employee where emp_id = ?', [req.params.emp_id], 
//				function(error, result){
//					if(error){
//						console.log('readFile Error');
//					}else{
//						res.send( ejs.render(data, { 
//							employee : result[0] 
//						}));
//					}
//				});
//	});
//});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/emp_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into employee(emp_id, emp_name,emp_eng_name, start_date, dept, rank, salary) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary ], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});

//app.post( '/edit/:emp_id', function(req, res){
//	var body = req.body;
//	
//	mySqlClient.query( 'update employee set emp_id=?, emp_name=?, emp_eng_name=?,start_date=?, dept=?, rank=?, where salary=?',
//			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary ], 
//			function(error, result){
//				if(error){
//					console.log('update error : ', error.message );
//				}else{
//					res.redirect('/');
//				}
//	});
//});