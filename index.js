// Express 기본 모듈 불러오기
var express = require('express');
// Express 객체 생성
var app = express();
var http = require('http');
var server = http.createServer(app);

// ejs view와 렌더링 설정
app.use(express.static('html_template'));
app.use(express.static('html_template/html'));
app.use('/html_template', express.static('./static/css'))
app.use('/html_template', express.static('./static/js'))
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

// mysql 기본 모듈 불러오기
var mysql = require('mysql');
// connection 객체 생성
var connection = mysql.createConnection({
  // DB 연결 설정
  host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user : 'root',
  password: '12121212',
  database: 'dbTeam'
});
connection.connect(function (err) {
  if (err) {
    console.error('error connection: ' + err.stack);
    return;
  }
  // Connection 이 성공하면 로그 출력
  console.log('Success DB connection');
});

// 좌석 예매 gui
var socketio= require('socket.io');
var fs = require('fs');
var seats = [
           [1,1,0,0,1,1],
           [1,1,1,1,1,1],
           [1,1,1,1,1,1]];


app.get('/seats',
  function(request,response)
  {response.send(seats);});

app.get('/',
  function(request, response)
  {
fs.readFile('HTMLPage.html',function(error,data){
      response.send(data.toString());
        });
  });


// Express 서버 시작
server.listen(3307, function () {
    console.log('Example app listening on port 3306!');
});

// 라우팅 처리
// '/'을 통해 들어온 요청 처리
app.get('/', function (req, res) {
    res.render('index.html');
});
var io =
    socketio.listen(server);
 io.sockets.on('connection',
 function(socket){
   socket.on('reserve',
   	function(data)
   	{ seats[data.y][data.x]=2;
 io.sockets.emit('reserve', data);
   	  });
   socket.on('reserveBak',
   function(data)
   { seats[data.y][data.x]=1;
 io.sockets.emit('reserveBak', data);
      });
   });

   //로그인 구현
   app.get('/', function(req, res) {
    res.render('login.html');
  });
  
  app.post('/', function(req, res){
    var id = req.body.id;
    var pwd = req.body.pwd;
  
    var sql = `SELECT * FROM members WHERE log_id = ?`;
    connection.query(sql, [id], function(error, results, fields){
      if(results.length == 0){

        res.render('login.html');
      }
      else{
        var db_name = results[0].log_id;  //'username'는 데이터베이스 칼럼 이름
        var db_pwd = results[0].log_pw;  //'pwd'또한 데이터베이스 칼럼 이름

        if(pwd == db_pwd){;
          res.render('index.html');
        }
        else{
          res.render('login.html');
        }
      }
    });
  });

  // 회원가입 연동
  app.get('/sign_up', function(req, res) {
    res.render('sign_up.html');
  });
  
  app.post('/sign_up', function(req, res){
    var log_id = req.body.log_id;
    var log_pw = req.body.log_pw;
    var pwdconf = req.body.pwdconf;
    var gender = req.body.gender;
    var mem_id = req.body.mem_id;
    var phone_num = req.body.phone_num;
    var email = req.body.email;
    if(log_pw === pwdconf){

      //DB에 쿼리 알리기
      var sql = `INSERT INTO members (mem_id,log_id,log_pw,pwdconf,gender,phone_num,email) VALUES(?, ?, ?, ?, ?, ?, ?)`;
      connection.query(sql, [mem_id,log_id,log_pw,pwdconf,gender,phone_num,email], function(error, results, fields){
        console.log(error);
      });
  
      res.redirect('/');
    }
    else{
      res.render(alert("비밀번호 오류"));
      res.render('sign.html');
    }
  });
module.exports = app;