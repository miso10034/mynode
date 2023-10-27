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

    router.get('/enter', function(req, res){
        // res.sendFile(__dirname + '/enter.html');
        res.render('enter.ejs');
    })

module.exports = router;


