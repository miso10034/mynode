///////// MySQL + Node.js 접속 코드
let mysql = require('mysql');
//require => 라이브러리 가져오는 것
// mysql => 미들웨어 객체

// mysql의 createConnection 객체로 아래의 정보로 접속을 시도
// 실패시 null
var conn = mysql.createConnection({
    host : "127.0.0.1",
    user : "root",
    password : "123456",
    database : "myboard",
    port : 3306
});

conn.connect(); // connect => apply라고 보면 된다.

//////////// 몽고DB 접속코드 ////////////
var mongodbclient = require('mongodb').MongoClient;
const url = 'mongodb+srv://mimisoso:1111@cluster0.cxhranz.mongodb.net/?retryWrites=true&w=majority';
const ObjId = require('mongodb').ObjectId;

let mydb;


mongodbclient.connect(url)
    .then(client => { 
        // 1단계 : myboard라는 이름의 데이터베이스에 접근하겠다.
        mydb = client.db('myboard');

        console.log('몽고 DB 접속 성공');
        // listen(포트번호, 호스트이름(생략가능), 콜백함수)
        app.listen(8081, function(){
            console.log("포트 8080 서버 대기중이어유~!")
        })
    })
    .catch(err => {
        console.log(err)
    })

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

//// 패스포트 설정
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

/////////sha 256 사용
const sha = require('sha256');

////////// 미들웨어 ////////////
app.set('view engine','ejs');

app.use(express.static("public"));

////////// EJS 설정 ////////////////
app.set('view engine', 'ejs')

// cookie-parser 미들웨어 추가
let cookieParser = require('cookie-parser');

app.use(cookieParser('목아픔'));

app.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000
    if(isNaN(milk)){ // NaN은 Not a Number
        milk = 0;
    }
    res.cookie('milk', milk, {signed : true}); // 쿠키 생성
    res.send('product : ' + milk + '원'); // 쿠키를 브라우저로 전송
})

app.get('/clear', function(req, res){
    res.clearCookie('milk');
    res.send('쿠키가 제거되었습니다.');
})

////////// express-session 미들웨어 추가
let session = require('express-session');

/// 미들웨어 설정
app.use(session({
    // 세션을 암호화하기 위해 설정해주는 것 : secret
    secret : 'asdfasdf1234',
    // 세션을 접속할때마다 새로운 세션발급여부
    resave : false,
    // 새로운 세션 발급전까지 사용여부
    saveUninitialized : true
}));
// 세션요청라우터
app.get('/session', function(req, res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }

    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + "원");
})

////// passport 미들웨어
app.use(passport.initialize());
app.use(passport.session());


////////// body-parser 미들웨어 추가 ///////////
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req, res){
    console.log("배꼽시계가 울고 있다 엉엉~!")
    res.render('index.ejs')
    // res.sendFile(__dirname + '/index.html');
})

// '/book' 요청 시 처리 코드
// get(요청 url, 콜백함수(요청, 응답))
app.get('/book', function(req, res){
    console.log("도서 목록 관련 페이지 입니다.");
    res.send("도서 목록 관련 페이지 입니다.")
})

// 라우터 생성 => localhost:8080/list를 요청한다면 그때 DB의 list를 보여지게
app.get('/list',function(req, res){
    //query("요청 쿼리문", 콜백함수)
    // conn.query("select * from post", function(err, rows, fields){
    //     if(err) throw err;
    //     console.log(rows);
    // })
    // 2단계 : 컬렉션=행단위인의 이름이 post에 접근
    mydb.collection('post').find().toArray()
    .then(result => {
    // result에 post 컬렉션에 있는 데이터를 넣어 가져옴
        res.render('list.ejs', {data : result})
    })

    // res.sendFile(__dirname + '/list.html');
    
})

app.get('/enter', function(req, res){
    // res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
})

app.post('/save', function(req,res){
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    
/////////////// 몽고DB에 데이터 저장하기 //////////
    mydb.collection('post').insertOne(
        {
            title : req.body.title,
            content : req.body.content,
            date : req.body.someDate
        }).then(result => {
            console.log(result);
            console.log('데이터 추가 성공');
        })

///////////// MYSQL DB에 데이터 저장하기 //////////
    // let sql = "INSERT INTO post (title, content,created) VALUES(?, ?, NOW())";
    // let params = [req.body.title, req.body.content];
    // conn.query(sql, params, function(err, result){
    //     if(err) throw err;
    //     console.log("데이터 추가 성공");
    // });
    // res.send('데이터 추가 성공');
    res.redirect('/list');
})

/////////// delete 버튼 눌렀을 때 처리하는 코드 ///////////
app.post('/delete', function(req, res){
    console.log(req.body._id);
    req.body._id = new ObjId(req.body._id);
    console.log(req.body._id);
    // deleteOne, deleteMany
    mydb.collection('post').deleteOne(req.body)
    .then(result => {
        console.log('삭제완료');
        res.status(200).send();
    })
    .catch(err =>{
        console.log(err);
        res.status(500).send();

    })
})
                // id => 변수명으로 설정해주는 값
app.get('/content/:id', function(req, res){
    // console.log(req.params.id); // url 파라미터를 갖고 오는 방법
    
    req.params.id = new ObjId(req.params.id);
    mydb.collection("post")
    .findOne({ _id : req.params.id })
    // 데이터베이스에 _id가 있는지 찾는 부분
    .then((result)=>{
        console.log(result);
        res.render('content.ejs', {data : result});
    }) 
})

app.get('/edit/:id', function(req, res){
    // console.log(req.params.id);

    req.params.id = new ObjId(req.params.id);
    mydb.collection("post")
    .findOne({ _id : req.params.id })
    .then((result)=>{
        console.log(result);
        res.render('edit.ejs', {data : result});
    }) 
})


app.post('/edit', function(req,res){

    // console.log(req.body)// body안에 1개의 행에 대한 모든 데이터가 들어있음
    req.body.id = new ObjId(req.body.id)

///////// 몽고DB에 데이터 수정하기 //////////
    mydb.collection('post').updateOne({_id : req.body.id}, 
    {$set : {title : req.body.title, content : req.body.content, date : req.body.someDate}}
    ).then(result => {
        console.log('데이터 수정 완료');
        res.redirect('/list');
        // redirect() 안에 이동할 url 요청 경로를 넣기
    })
    .catch(err =>{
        console.log(err);
    })
})


//////////// 회원가입
app.get('/signup', function(req, res){
    res.render('signup.ejs')
})

app.post('/signup', function(req, res){
    console.log('아이디 : ' + req.body.userid);
    console.log('비밀번호 : ' + sha(req.body.userpw));
    console.log('소속 : ' + req.body.usergroup);
    console.log('이메일 : ' + req.body.useremail);

    mydb.collection('account')
    .insertOne({
        userid : req.body.userid,
        userpw : sha(req.body.userpw),
        usergroup : req.body.usergroup,
        useremail : req.body.useremail

    })
    .then(result =>{
        console.log('회원가입 성공');
    })
    res.redirect('/');
})

app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', { user : req.session.user});
    }else{
        res.render('login.ejs');
    }
   
})
                 // 미들웨어
app.post('/login',       // 로컬로 인증하고 실패시 /login으로 리다이렉트해라
    passport.authenticate("local",{
        succeessRedirect : "/",
        failureRedirect : "/login"
    }),
    function(req, res){
        console.log(req.session);
        console.log(req.session.passport);
    }
)

passport.use(new LocalStrategy(
    {
        usernameField : "userid",
        passwordField : "userpw",
        session : true,
        passReqToCallback : false,
    },
    function(inputid, inputpw, done){
        mydb.collection('account')
        .findOne({userid : inputid})
        .then(result=>{
            if(result.userpw = sha(inputpw)){
                console.log('새로운 로그인');
                done(null, result);
            }
            else{
                console.log('비밀번호가 틀렸습니다.');
                done(null, false, {message : "비밀번호가 틀렸습니다."});
            }
        })
        
    }
))
//최초 로그인                             // result값이 user로 넘어옴
passport.serializeUser(function(user, done){
    console.log("serializerUser");
    console.log(user);
    done(null, user);
})

//세션 유지
passport.deserializeUser(function(puserid, done){
    console.log('deserializerUser');
    console.log(puserid);

    mydb.collection('account')
    .findOne({userkey : userkey})
    .then(result=>{
        console.log(result);
        done(null, result);
    })
})
    // //1. 브라우저에서 입력한 id, pw 가져오기
    // //2. DB에서 id, pw 가져오기
    // console.log('아이디 : ' + req.body.userid);
    // console.log('비밀번호 : ' + req.body.userpw);

    // mydb.collection('account')
    // .findOne(
    //     {userid : req.body.userid})
    //     .then((result) => {
    //         if(result.userpw == sha(req.body.userpw)){
    //             req.session.user = req.body;
    //             console.log('새로운 로그인');
    //             res.render('index.ejs', { user : req.session.user});
    //         }else{
    //             res.render('login.ejs');
    //         }
    //     })
    //     .catch( err =>{
    //         res.send('아이디를 찾지 못했습니다.');
    //     })


/////////// 로그아웃
app.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', { user : null});
})

app.get('/facebook', passport.authenticate('facebook'));

app.get('facebook/callback',
    passport.authenticate(
        'facebook',
        {
            successRedirect : '/',
            failureRedirect : 'fail',
        }),
        function (req, res){
            console.log(req.session);
            console.log(req.session.passport);
            res.render('index.ejs', {user : req.session.passport});
        }
)

passport.use(new FacebookStrategy(
    {
        clientID : '',
        clientSecret : '',
        callbackURL : '/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done){
        console.log(profile);

        let authkey = 'facebook'+profile.id;
        let authName = profile.displayName;

        let loop = 0;
        while(loop < 2){
            mydb.collection('account')
            .findOne({userkey : authkey})
            .then(result=>{
                if(result != null){
                    done(null, result);
                }
                else{
                    mydb.collection('account')
                    .insertOne({
                        userkey : authkey,
                        userid : authName, 
                    })
                }
            })
            .catch(error => {
                done(null, false, error);
            })
            .loop++
        }
    }
))


