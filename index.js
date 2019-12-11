// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser'); // POST 방식 전송을 위해서 필요함
var JSAlert = require("js-alert");
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
var dateFormat = require('dateformat');

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
  var sql = `SELECT mov_name, mov_desc, mov_eng_name FROM movie`;

  connection.query(sql, function(error, results, fields){
    console.log(results);
    if (req.session.user) {
      res.render('index.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results
      });
    } else {
      res.render('index.ejs', {
        logined : false,
        user_id : null,
        results

      });
    }
  });

});

//로그인 구현
app.get('/login_rv', function(req, res) {
  res.send(`
  <script>
   alert("로그인 후 이용 가능합니다.");
  location.href='http://localhost:3307/login';
 </script>
`);
});


app.get('/login', function(req, res) {
  res.render('login.ejs');
});

app.post('/', function(req, res) {
    var id = req.body.id;
    var pwd = req.body.pwd;

    var sql = `SELECT * FROM members WHERE log_id = ?`;
    var sql2 = `SELECT mov_name, mov_desc, mov_eng_name FROM movie`;
    connection.query(sql, [id], function(error, results, fields) {
        if (results.length == 0) {
          var session = req.session;
          res.send(`
          <script>
           alert("로그인 정보를 다시 확인해주세요");
          location.href='http://localhost:3307/login';
         </script>
        `);
          console.log(session);

         // res.render('login.ejs');

        } else {
          console.log(results[0]);
          var db_name = results[0].log_id;
          var db_pwd = results[0].log_pw; //'pwd'또한 데이터베이스 칼럼 이름

          req.session.user = {
            logined: true,
            user_id: db_name

          }
          res.send(`
          <script>
           alert("로그인 되었습니다.");
           location.href='http://localhost:3307';
         </script>
        `);
    connection.query(sql2, function(error, results, fields){
          res.render('index.ejs', {
            logined: req.session.user.logined,
            user_id: req.session.user.user_id,
            results



          });
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
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.clearCookie('id');
  console.log('logout complete!');
  res.send(`
  <script>
   alert("로그아웃 되었습니다.");
   location.href='http://localhost:3307';
 </script>
`);
  var sql2 = `SELECT mov_name, mov_desc, mov_eng_name FROM movie`;
  connection.query(sql2, function(error, results, fields){
  res.render('index.ejs', {
    logined : false,
    user_id : null,
    results
  });

});
});

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
    res.send(`
    <script>
     alert("회원가입이 완료되었습니다. 다시 로그인 해주세요.");
     location.href='http://localhost:3307/login';
   </script>
  `);
  } else {

  }
});

app.get('/mega',function(req, res){
  res.render('mega.ejs');
});

app.get('/Ticketing', function(req,res){
  res.render('Ticketing.ejs');
});

app.get('/movie_info', function(req, res) {

 var sql = `SELECT * FROM movie`;

 connection.query(sql, function(error, results, fields) {
   console.log(results);
   var open_date0 = dateFormat(results[0].open_date, "yyyy.mm.dd");
   var open_date1 = dateFormat(results[1].open_date, "yyyy.mm.dd");
   var open_date2 = dateFormat(results[2].open_date, "yyyy.mm.dd");
   var open_date3 = dateFormat(results[3].open_date, "yyyy.mm.dd");
  if (req.session.user) {
    res.render('movie_info.ejs', {
      logined : req.session.user.logined,
      user_id : req.session.user.user_id,
      results,
      open_date0,open_date1,open_date2,open_date3
    });
  } else {
    res.render('movie_info.ejs', {
      logined : false,
      user_id : null,
      results,
      open_date0,open_date1,open_date2,open_date3
    });
  }
});

});
app.get('/screen', function(req, res) {
  var sql = `SELECT * FROM movie`;
  connection.query(sql, function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('screen.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results
      });
    } else {
      res.render('screen.ejs', {
        logined : false,
        user_id : null,
        results
      });
    }
  });

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
    var sql3 = 'SELECT * FROM timetable';
    var sql4 = 'SELECT * FROM seats';
    var sql5 = 'SELECT * FROM movie';
    connection.query(sql5,function(error,result_movie,fields){
    connection.query(sql3, function(error,results,fields){
      connection.query(sql4,function(error,results_gimoring,fields){

      if (req.session.user) {
        res.render('tic_seat.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
          results_gimoring,
          result_movie


        });
      } else {
        res.render('tic_seat.ejs', {
          logined : false,
          user_id : null,
          results,
          results_gimoring,
          movie
        });
      }
    })
    })
  })

  });

// 예매완료
  app.post('/tic_seat', function(req,res){
    var body = req.body;
    var onseats =req.body.onseat;
    var onseat = req.body.onseat.split("_");
    var k = 0 ;
    var os ;
    var mem_id = req.body.mem_id;
    var phone_num= req.body.phone_num;
    //
    var ti_id;
    var mov_name;
    var ci_name;
    var sc_num;
    var seat;
    var id;


    if(onseat.length==2){
      os= onseat;
    }else {
      k = 1;// 여러개 예매
      onseat = req.body.onseat.split(',');
      for(let i = 0 ; i < onseat.length;i++){
        onseat[i]= onseat[i].split('_');
      }
    }
    var gimotin = parseInt(req.body.anggimo);

    var price = req.body.p;
    var sql4 = 'select seat from seats where seats_id = ? ';
    var sql5 = 'select * from member where mem_id = ?'
    connection.query(sql4,[gimotin],function(error,result_gimoring,fields){
      // connection.query(sql5, function(result_mem){
      //   result_mem
      // })
      // console.log(result_mem);
      seat = result_gimoring[0].seat.split('|')
      if(k==1){
        for(let i = 0 ; i < onseat.length;i++){
          osr = parseInt(onseat[i][0])-1;
          osc = parseInt(onseat[i][1])-1;
          seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

        }
      }
      else {
        osr = parseInt(os[0])-1;
        osc = parseInt(os[1])-1;
        seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

      }
        seats = seat[0];
      for(let i = 1 ; i < seat.length;i++){
        seats = seats.concat("|",seat[i]);
      }
      var param1 = [seats,1];
      connection.query('update seats set seat = ? where seats_id = ?',param1);
    var sql5 = 'insert into booking(seat,price) values(?,?)';

    // ticket에 정보 넣기 ~~ yamete!!
    var yamete_pr = ['YhDy', 'Jungang', 1, onseats, req.session.user.user_id];
    var sql7 = 'insert into ticket (mov_name, ci_name, sc_num, seat, mem_id) values(?, ?, ?, ?, ?)';
    connection.query(sql7, yamete_pr);

    // ticket 정보 꺼내와서 tic_complete.ejs로 보내주기 ~~ gudasai!!
    var sql6 = 'select * from ticket where seat = ?';
    connection.query(sql6, onseats, function(error, gudasai, fields) {
      ti_id = gudasai[0].ti_id;
      mov_name = gudasai[0].mov_name;
      ci_name = gudasai[0].ci_name;
      sc_num = gudasai[0].sc_num;
      seat = gudasai[0].seat;
      id = gudasai[0].mem_id;
    });

    connection.query(sql5 , [onseats,parseInt(price)],function(){
      console.log(onseats);
      // res.redirect('/');
      // 진행중
      res.render('tic_complete.ejs', {
        ti: ti_id,
        mov: mov_name,
        ci: ci_name,
        sc: sc_num,
        st: seat,
        logined: true,
        user_id: id
      })
    })
    })
  });

  app.get('/tic_seat1-2', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    var sql4 = 'SELECT * FROM seats';
    var sql5 = 'SELECT * FROM movie';
    connection.equery(sql5,function(error,result_movie,fields){
    connection.query(sql3, function(error,results,fields){
      connection.query(sql4,function(error,results_gimoring2,fields){

      if (req.session.user) {
        res.render('tic_seat1-2.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
          results_gimoring2,
          result_movie

        });
      } else {
        res.render('tic_seat1-2.ejs', {
          logined : false,
          user_id : null,
          results,
          results_gimoring2,
          result_movie
        });
      }
    })
    })
  })
});
  app.post('/tic_seat1-2', function(req,res){
    var body = req.body;
    var onseats2 = req.body.onseat2;
    var onseat2 = req.body.onseat2.split("_");
    var k = 0 ;
    var os ;
    if(onseat2.length==2){
      os= onseat2;
    }else {
      k = 1;// 여러개 예매
      onseat2 = req.body.onseat2.split(',');
      for(let i = 0 ; i < onseat2.length;i++){
        onseat2[i]= onseat2[i].split('_');
      }
    }
    var gimotin = parseInt(req.body.anggimo2);
    var price = req.body.p;
    var sql4 = 'select seat from seats where seats_id = ? ';
    connection.query(sql4,[gimotin],function(error,result_gimoring2,fields){
      seat = result_gimoring2[0].seat.split('|')
      if(k==1){
        for(let i = 0 ; i < onseat2.length;i++){
          osr = parseInt(onseat2[i][0])-1;
          osc = parseInt(onseat2[i][1])-1;
          seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

        }
      }
      else {
        osr = parseInt(os[0])-1;
        osc = parseInt(os[1])-1;
        seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

      }


        seats = seat[0];
      for(let i = 1 ; i < seat.length;i++){
        seats = seats.concat("|",seat[i]);
      }
      console.log(onseats2);
      var param2 = [seats,4];
      connection.query('update seats set seat = ? where seats_id =?',param2);
    var sql5 = 'insert into booking(seat,price) values(?,?)';
    connection.query(sql5 , [onseats2,parseInt(price)],function(){

      res.redirect('/');
    })
    })
  });

  app.get('/tic_seat1-3', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    var sql4 = 'SELECT * FROM seats'
    var sql5 = 'SELECT * FROM movie';
    connection.equery(sql5,function(error,result_movie,fields){
    connection.query(sql3, function(error,results,fields){
      connection.query(sql4,function(error,results_gimoring3,fields){

      if (req.session.user) {
        res.render('tic_seat1-3.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
          results_gimoring3,
          result_movie

        });
      } else {
        res.render('tic_seat1-3.ejs', {
          logined : false,
          user_id : null,
          results,
          results_gimoring3,
          result_movie
        });
      }
    })
    })
  })
  });
  app.post('/tic_seat1-3', function(req,res){
    var body = req.body;
    var onseats3 = req.body.onseat3;
    var onseat3 = req.body.onseat3.split("_");
    var k = 0 ;
    var os ;
    if(onseat3.length==2){
      os= onseat3;
    }else {
      k = 1;// 여러개 예매
      onseat3 = req.body.onseat3.split(',');
      for(let i = 0 ; i < onseat3.length;i++){
        onseat3[i]= onseat3[i].split('_');
      }
    }
    var gimotin = parseInt(req.body.anggimo3);
    var price = req.body.p;
    var sql4 = 'select seat from seats where seats_id = ? ';
    connection.query(sql4,[gimotin],function(error,result_gimoring3,fields){
      seat = result_gimoring3[0].seat.split('|')
      if(k==1){
        for(let i = 0 ; i < onseat3.length;i++){
          osr = parseInt(onseat3[i][0])-1;
          osc = parseInt(onseat3[i][1])-1;
          seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

        }
      }
      else {
        osr = parseInt(os[0])-1;
        osc = parseInt(os[1])-1;
        seat[osr]  = seat[osr].substr(0,osc).concat("a", seat[osr].substr(osc+1) ); ;

      }


        seats = seat[0];
      for(let i = 1 ; i < seat.length;i++){
        seats = seats.concat("|",seat[i]);
      }
      console.log(onseats3);
      var param3 = [seats,5];
      connection.query('update seats set seat = ? where seats_id =?',param3);
    var sql5 = 'insert into booking(seat,price) values(?,?)';
    connection.query(sql5 , [onseats3,parseInt(price)],function(){

      res.redirect('/');
    })
    })
  });

  app.get('/tic_seat2', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat2.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat2.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });
  app.get('/tic_seat2-1', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat2-1.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat2-1.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });
  app.get('/tic_seat2-3', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat2-3.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat2-3.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });
  app.get('/tic_seat3', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat3.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat3.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });
  app.get('/tic_seat3-1', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat3-1.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat3-1.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });app.get('/tic_seat3-2', function(req,res){
    var sql3 = 'SELECT * FROM timetable';
    connection.query(sql3,function(error,results,fields){
      console.log(results);
      if (req.session.user) {
        res.render('tic_seat3-2.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          results,
        });
      } else {
        res.render('tic_seat3-2.ejs', {
          logined : false,
          user_id : null,
          results,
        });
      }
    });
  });
app.get('/tic_seat4', function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('tic_seat4.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('tic_seat4.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});
app.get('/tic_seat4-1', function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('tic_seat4-1.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('tic_seat4-1.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});
app.get('/tic_seat4-2', function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('tic_seat4-2.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('tic_seat4-2.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});



//영화1
app.get('/timetable',function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('timetable.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('timetable.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});

//영화2
app.get('/timetable2',function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    if (req.session.user) {
      res.render('timetable2.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('timetable2.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});

//영화3
app.get('/timetable3',function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('timetable3.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('timetable3.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});

//영화4
app.get('/timetable4',function(req,res){
  var sql3 = 'SELECT * FROM timetable';
  connection.query(sql3,function(error,results,fields){
    console.log(results);
    if (req.session.user) {
      res.render('timetable4.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results,
      });
    } else {
      res.render('timetable4.ejs', {
        logined : false,
        user_id : null,
        results,
      });
    }
  });
});

app.get('/tic_complete', function(req, res) {
  res.render('tic_complete.ejs', {
    logined: false,
    user_id: null
  })
})


app.get('/mem_info',function(req,res){
  var sql10 = 'SELECT * FROM members where log_id = ?';
  var sql11 = 'SELECT * FROM ticket where mem_id = ?'
  console.log(req.session);
  connection.query(sql10,[req.session.user.user_id],function(error,ikuoit,fields){
    connection.query(sql11,[req.session.user.user_id],function(error,gandait,fields){
      if (req.session.user) {
        res.render('mem_info.ejs', {
          logined : req.session.user.logined,
          user_id : req.session.user.user_id,
          ikuoit,
          gandait,
        });
      }
    });
  });
});

module.exports = app;
