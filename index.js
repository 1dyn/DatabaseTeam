// Express 기본 모듈 불러오기
var express = require('express');
// Express 객체 생성
var app = express();

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

// Express 서버 시작
app.listen(3307, function () {
    console.log('Example app listening on port 3306!');
});

// 라우팅 처리
// '/'을 통해 들어온 요청 처리
app.get('/', function (req, res) {
    res.render('index.html');
});
//app.get('/register', function (req, res) {
//    res.render('register.html');
//});
//app.post('/register', function (req, res) {
//  var name = req.body.name;
//  var pwd = req.body.pwd;
//  var pwdconf = req.body.pwdconf;
//  console.log(name, pwd);
//});
//app.get('/welcome', function (req, res) {
//    res.render('welcome.html');
//});

