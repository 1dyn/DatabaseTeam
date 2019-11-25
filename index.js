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
app.use(express.static('html_template'));
app.use(express.static('html_template/html'));
app.use('/html_template', express.static('./static/css'))
app.use('/html_template', express.static('./static/js'))
app.use(express.static('routes'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// resave 세션아이디를 접속할때마다 발급하지 않는다
app.use(session({
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

// 좌석 예매 gui
var socketio = require('socket.io');
var fs = require('fs');
var seats = [
  [1, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1]
];


app.get('/seats',
  function(request, response) {
    response.send(seats);
  });

app.get('/',
  function(request, response) {
    fs.readFile('HTMLPage.html', function(error, data) {
      response.send(data.toString());
    });
  });


// Express 서버 시작
server.listen(3307, function() {
  console.log('Example app listening on port 3307!');
});

// 라우팅 처리
// '/'을 통해 들어온 요청 처리
app.get('/', function(req, res) {
  res.render('index.html');
});
var io =
  socketio.listen(server);
io.sockets.on('connection',
  function(socket) {
    socket.on('reserve',
      function(data) {
        seats[data.y][data.x] = 2;
        io.sockets.emit('reserve', data);
      });
    socket.on('reserveBak',
      function(data) {
        seats[data.y][data.x] = 1;
        io.sockets.emit('reserveBak', data);
      });
  });

//로그인 구현
app.get('/', function(req, res) {
  if (req.session.logined) {
    res.render('index_log.html', {session: req.session})
    console.log("login!!");
  } else {
    res.render('login.html', {session: req.session})
    console.log("retry!!");
  }
});

app.post('/', function(req, res) {
    var id = req.body.id;
    var pwd = req.body.pwd;

    var sql = `SELECT * FROM members WHERE log_id = ?`;
    connection.query(sql, [id], function(error, results, fields) {
        if (results.length == 0) {
          var session = req.session;
          console.log("try again~")
          console.log(session)
          res.render('login.html');
        } else {
          var db_name = results[0].log_id; //'username'는 데이터베이스 칼럼 이름
          var db_pwd = results[0].log_pw; //'pwd'또한 데이터베이스 칼럼 이름

          req.session.regenerate(function() {
            req.session.logined = true;
            var session = req.session;
            console.log("login success!");
            console.log(session);
            console.log("id: " + db_name);
            console.log("pw: " + db_pwd);
            res.render('index_log.html', {session: req.session})
          })
        }
      });
    });

// 회원가입 연동
app.get('/sign_up', function(req, res) {
  res.render('sign_up.html');
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
    res.render('sign.html');
  }
});
module.exports = app;