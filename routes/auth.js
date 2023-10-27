// 라우터 객체 갖고 오기
var router = require('express').Router();

//////////// 몽고DB 접속코드 ////////////
var mongodbclient = require('mongodb').MongoClient;
const url = process.env.DB_URL;
const ObjId = require('mongodb').ObjectId;

let mydb;

mongodbclient.connect(url)
    .then(client => { 
        // 1단계 : myboard라는 이름의 데이터베이스에 접근하겠다.
        mydb = client.db('myboard');
    })
    .catch(err => {
        console.log(err)
    })

    router.get('/login', function(req, res){
        console.log(req.session);
        if(req.session.user){
            console.log('세션 유지');
            res.render('index.ejs', { user : req.session.user});
        }else{
            res.render('login.ejs');
        }
    })
    
    router.post('/login', function(req, res){
    
        //1. 브라우저에서 입력한 id, pw 가져오기
        //2. DB에서 id, pw 가져오기
        console.log('아이디 : ' + req.body.userid);
        console.log('비밀번호 : ' + req.body.userpw);
    
        mydb.collection('account')
        .findOne(
            {userid : req.body.userid})
            .then((result) => {
                if(result.userpw == sha(req.body.userpw)){
                    req.session.user = req.body;
                    console.log('새로운 로그인');
                    res.render('index.ejs', { user : req.session.user});
                }else{
                    res.render('login.ejs');
                }
            })
            .catch( err =>{
                res.send('아이디를 찾지 못했습니다.');
            })
    })
    

module.exports = router;


