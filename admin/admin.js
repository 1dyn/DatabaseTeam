var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var dateFormat = require('dateformat');

var bodyParser = require('body-parser');
var app = express();

app.use(session({
  key: 'admin',
  secret: 'admin',
  resave: true,
  saveUninitialized: true
}));

var mySqlClient = mysql.createConnection({
  host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user : 'root',
  password: '12121212',
  database: 'dbTeam'
});

app.use(express.static('admincss'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

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

//----------------------------------------------------- 관리자 페이지 시작

app.get( '/', function(req, res){
	fs.readFile('index.html', 'utf8', function(error, data){
		if (error) {
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/login', function(req, res){
	var id = req.body.id;  
	var pw = req.body.pw; 
	var adminid ='admin1';
	var adminpw ='admin2';

	var adminlogin = mySqlClient.query('select * from admin where ad_num=?',1, function(error,results){
		if (error) {
			console.log('select error : ', error.message );
		}else{
			var adminid = results[0].ad_id;
			var adminpw = results[0].ad_pw;
			console.log(adminid);
			if(id === adminid && pw === adminpw){
				res.redirect('/admin');
			}else {
				res.redirect('/login');
			}
				}
	});


});

app.get('/login', function(req, res){
	fs.readFile('login.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});


app.get('/admin', function(req, res){
	fs.readFile('admin.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

// -------------------------------------------------- 직원 관리 시작

app.get('/emp_insert', function(req, res){
	fs.readFile('emp_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/emp_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into employee(emp_id, emp_name,emp_eng_name, start_date, dept, rank, salary) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary ], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

app.get( '/emp_list', function(req, res){
	
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


app.get('/emp_list/delete/:emp_id', function(req, res){
	mySqlClient.query('delete from employee where emp_id = ?', [req.params.emp_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete emp_id = %s', req.params.emp_id);
					res.redirect('/admin');				
				}
			});
});  



 app.get( '/emp_edit/:emp_id', function(req, res){
 	fs.readFile( 'emp_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from employee where emp_id = ?', [req.params.emp_id], 
 				function(error, result){
					var start_date =  dateFormat(result.start_date, "yyyy.mm.dd");
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
							 employee : result[0],
							 emp_start_date : dateFormat(result.start_date, "yyyy.mm.dd")
							  
 						}));
 					}
 				});
 	});
 });


app.post( '/emp_edit/:emp_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update employee set emp_id=?, emp_name=?, emp_eng_name=?,start_date=?, dept=?, rank=?, salary=? where emp_id =?',
			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary, body.emp_id ], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

// ------------------------------------------------  영화 정보 관리 시작

app.get('/mov_insert', function(req, res){
	fs.readFile('mov_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/mov_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into movie(mov_id, mov_name, open_date, genre, mov_eng_name, mov_desc, mov_rated, mov_img, mov_runtime, mov_country) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[ body.mov_id, body.mov_name, body.open_date, body.genre, body.mov_eng_name, body.mov_desc, body.mov_rated, body.mov_img, body.mov_runtime, body.mov_country], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

app.get( '/mov_list', function(req, res){
	fs.readFile('mov_list.html', 'utf8', function(error, data){
		var sql = 'SELECT * FROM movie';
		
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query(sql, function(error, results){
				// var open_date = dateFormat(results.open_date, "yyyy.mm.dd");
				// // var open_date = results[0].open_date;
				// console.log(open_date);
				// console.log(dateFormat(results.open_date, "yyyy.mm.dd"));
				// console.log(dateFormat(results[0].open_date, "yyyy.mm.dd"));
				// console.log(dateFormat(results[1].open_date, "yyyy.mm.dd"));
				// console.log(dateFormat(results[2].open_date, "yyyy.mm.dd"));
				// console.log(dateFormat(results[3].open_date, "yyyy.mm.dd"));
				if(error){
					console.log('error : ', error.message);
				}else{
					res.send( ejs.render(data, {
						prodList : results,
						// a : dateFormat(item.open_date, "yyyy.mm.dd")	 
						// results.open_date
					}));
				}
			});
		} 
	})
});

app.get('/mov_list/delete/:mov_id', function(req, res){
	mySqlClient.query('delete from movie where mov_id = ?', [req.params.mov_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete mov_id = %s', req.params.mov_id);
					res.redirect('/admin');				
				}
			});
});


 app.get( '/mov_edit/:mov_id', function(req, res){
 	fs.readFile( 'mov_edit.html', 'utf8', function(error, data){
		 mySqlClient.query('select * from movie where mov_id = ?', [req.params.mov_id], 
		 
 				function(error, result){
					var open_date = dateFormat(result.open_date, "yyyy.mm.dd");
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
							 movie : result[0] ,
							 mov_open_date : dateFormat(result[0].open_date, "yyyy.mm.dd")	 
 						}));
 					}
 				});
 	});
 });

app.post( '/mov_edit/:mov_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update movie set mov_id=?, mov_name=?, open_date=?, genre=?, mov_eng_name=?, mov_desc=?, mov_rated=?, mov_img=?, mov_runtime=?, mov_country=? where mov_id =?',
			[ body.mov_id, body.mov_name, body.open_date, body.genre, body.mov_eng_name, body.mov_desc, body.mov_rated, body.mov_img, body.mov_runtime, body.mov_country , body.mov_id], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});
// ------------------------------------------------- 비품 관리 시작 

app.get('/sup_insert', function(req, res){
	fs.readFile('sup_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/sup_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into supplies(sup_id, ci_id, sup_name, size, total, price, sup_in) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.sup_id, body.ci_id, body.sup_name, body.size, body.total, body.price, body.sup_in], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

app.get( '/sup_list', function(req, res){
	
	fs.readFile('sup_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from supplies', function(error, results){
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

app.get('/sup_list/delete/:sup_id', function(req, res){
	mySqlClient.query('delete from supplies where sup_id = ?', [req.params.sup_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete sup_id = %s', req.params.sup_id);
					res.redirect('/admin');				
				}
			});
});

app.get( '/sup_edit/:sup_id', function(req, res){
 	fs.readFile( 'sup_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from supplies where sup_id = ?', [req.params.sup_id], 
 				function(error, result){
					var sup_in = dateFormat(result.sup_in, "yyyy.mm.dd");
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
							 supplies : result[0],
							 sup_in : dateFormat(result.sup_in, "yyyy.mm.dd")
 						}));
 					}
 				});
 	});
 });

app.post( '/sup_edit/:sup_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update supplies set sup_id=?, ci_id=?, sup_name=?, size=?, total=?, price=?, sup_in=? where sup_id =?',
			[ body.sup_id, body.ci_id, body.sup_name, body.size ,body.total, body.price, body.sup_in, body.sup_id ], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

//------------------------------------------------ 타임테이블 관리 시작


app.get('/timetable_insert', function(req, res){
	fs.readFile('timetable_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/timetable_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into timetable( tt_id, mov_name, sc_num, time, ci_name) values(?, ?, ?, ?, ?)',
			[ body.tt_id, body.mov_name, body.sc_num, body.time, body.ci_name], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

app.get( '/timetable_list', function(req, res){
	
	fs.readFile('timetable_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from timetable', function(error, results){
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

app.get('/timetable_list/delete/:tt_id', function(req, res){
	mySqlClient.query('delete from timetable where tt_id = ?', [req.params.tt_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete tt_id = %s', req.params.tt_id);
					res.redirect('/admin');				
				}
			});
});

app.get( '/timetable_edit/:tt_id', function(req, res){
 	fs.readFile( 'timetable_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from timetable where tt_id = ?', [req.params.tt_id], 
 				function(error, result){
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
 							timetable : result[0] 
 						}));
 					}
 				});
 	});
 });

app.post( '/timetable_edit/:tt_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update timetable set tt_id=?, mov_name=?, sc_num=?, time=?, ci_name=? where tt_id=?',
			[ body.tt_id, body.mov_name, body.sc_num, body.time, body.ci_name, body.tt_id], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/admin');
				}
	});
});

/*-------------------------login */

//app.get('/ad_login', function(req, res){
//	fs.readFile('ad_login.html', 'utf8', function(error, data){
//		if(error){
//			console.log('readFile Error');
//		}else{
//			res.send(data);
//		}
//	})
//});

//app.get('ad_login', function(req, res){
//    res.render('ad_login.html');
//});
//app.post('/ad_login', function(req, res){
//    var user_id = req.body.user_id;
//    var user_password = req.body.user_password;
//
//    var sql = 'SELECT * FROM user_info WHERE user_id = ?';
//    mySqlClient.query(sql, [user_id], function (error, results, fields) {
//        if (results.length == 0) {
//            res.render('ad_login.html', { alert: true });
//        } else {
//            var db_pwd = results[0].user_password;
//
//            if (user_password == db_pwd) {
//                //session
//                req.session.user = {
//                    logined: true,
//                    user_name: results[0].user_name
//                }
//
//                res.render('admin.html', {
//                    logined: req.session.user.logined,
//                    user_name: req.session.user.user_name
//                });
//            }
//            else {
//                res.render('ad_login.html', { alert: true });
//            }
//        }
//    });
//})