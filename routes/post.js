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

// 라우터 생성 => localhost:8080/list를 요청한다면 그때 DB의 list를 보여지게
router.get('/list',function(req, res){
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

module.exports = router;

