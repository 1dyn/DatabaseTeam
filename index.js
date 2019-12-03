// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser'); // POST 방식 전송을 위해서 필요함

// Express 기본 모듈 불러오기
var express = require('express');
var session = require('express-session');
// Express 객체 생성
var app = express();
var http = require('http');
var server = http.createServer(app);
var cookieParser = require('cookie-parser');
var router = express.Router();
var path = require('path');

// ejs
// app.set("view engine", "ejs");
// app.use(express.static(__dirname + '/public'));

// ejs view와 렌더링 설정
app.use(express.static('views'));
app.use(express.static('views'));
app.use('/views', express.static('./static/css'))
app.use('/views', express.static('./static/js'))
app.use(express.static('routes'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// resave 세션아이디를 접속할때마다 발급하지 않는다
app.use(session({
  key: 'sid',
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));

// mysql 기본 모듈 불러오기
var mysql = require('mysql');
// connection 객체 생성
var connection = mysql.createConnection({
  // DB 연결 설정
  host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: '12121212',
  database: 'dbTeam'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connection: ' + err.stack);
    return;
  }
  // Connection 이 성공하면 로그 출력
  console.log('Success DB connection');
});




// Express 서버 시작
server.listen(3307, function() {
  console.log('Example app listening on port 3307!');
});

// 라우팅 처리
// '/'을 통해 들어온 요청 처리
app.get('/', function(req, res) {
  if (req.session.user) {
    res.render('index.ejs', {
      logined : req.session.user.logined,
      user_id : req.session.user.user_id
    });
  } else {
    res.render('index.ejs', {
      logined : false,
      user_id : null
    });
  }
});

//로그인 구현
app.get('/login', function(req, res) {
  res.render('login.ejs');
});

app.post('/', function(req, res) {
    var id = req.body.id;
    var pwd = req.body.pwd;

    var sql = `SELECT * FROM members WHERE log_id = ?`;
    connection.query(sql, [id], function(error, results, fields) {
        if (results.length == 0) {
          var session = req.session;
          console.log("try again~");
          console.log(session);
          res.render('login.ejs');
        } else {
          var db_name = results[0].log_id;
          console.log(results[0]); //'username'는 데이터베이스 칼럼 이름
          var db_pwd = results[0].log_pw; //'pwd'또한 데이터베이스 칼럼 이름

          req.session.user = {
            logined: true,
            user_id: db_name
          }

          res.render('index.ejs', {
            logined: req.session.user.logined,
            user_id: req.session.user.user_id
          });
          // req.session.regenerate(function() {
          //   req.session.user.logined = true;
          //   req.session.user.user_id = db_name;
          //   req.session.user.user_pw = db_pwd;
          //   var session = req.session;
          //   console.log("login success!");
          //   console.log(session);
          //   res.cookie('id', db_name);
          //   res.redirect("/");
          // })
        }
      });
    });

// 로그아웃
app.post('/logout', function(req, res) {
  req.session.destroy();
  res.clearCookie('id');
  console.log('logout complete!');
  res.render('login.ejs');
})

// 회원가입 연동
app.get('/sign_up', function(req, res) {
  res.render('sign_up.ejs');
});

app.post('/sign_up', function(req, res) {
  var log_id = req.body.log_id;
  var log_pw = req.body.log_pw;
  var pwdconf = req.body.pwdconf;
  var gender = req.body.gender;
  var mem_id = req.body.mem_id;
  var phone_num = req.body.phone_num;
  var email = req.body.email;
  if (log_pw === pwdconf) {

    //DB에 쿼리 알리기
    var sql = `INSERT INTO members (mem_id,log_id,log_pw,pwdconf,gender,phone_num,email) VALUES(?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [mem_id, log_id, log_pw, pwdconf, gender, phone_num, email], function(error, results, fields) {
      console.log(error);
    });

    res.redirect('/');
  } else {
    res.render(alert("비밀번호 오류"));
    res.render('sign.ejs');
  }
});

app.get('/mega',function(req, res){
  res.render('mega.ejs');
});

app.get('/Ticketing', function(req,res){
  res.render('Ticketing.ejs');
});

app.get('/movie_info', function(req, res) {
  if (req.session.user) {
    res.render('movie_info.ejs', {
      logined : req.session.user.logined,
      user_id : req.session.user.user_id
    });
  } else {
    res.render('movie_info.ejs', {
      logined : false,
      user_id : null
    });
  }
});
app.get('/screen', function(req, res) {
  if (req.session.user) {
    res.render('screen.ejs', {
      logined : req.session.user.logined,
      user_id : req.session.user.user_id
    });
  } else {
    res.render('screen.ejs', {
      logined : false,
      user_id : null
    });
  }
});
app.get('/seat_ticket', function(req,res){
  res.render('seat_ticket.ejs');
});
// app.get('/sign_up', function(req,res){
//   res.render('sign_up.ejs');
// });

app.get('/tic_date', function(req,res){
  res.render('tic_date.ejs');
});
app.get('/tic_screen', function(req,res){
  res.render('tic_screen.ejs');
});

app.get('/tic_seat', function(req,res){
  res.render('tic_seat.ejs');
});


module.exports = app;
