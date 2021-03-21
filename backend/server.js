/* Requirements / Imports */
const express = require('express')
const mysql = require('mysql')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const async = require('async')
const port = process.env.PORT || 5000;
const db = require('./config/db');
const pool = mysql.createPool(db.connection);

// App.use

// Static directory
app.use(express.static(__dirname + '/public'));

// BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// CORS
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

/* ROUTES */
// GET '/'
app.get('/', function(req, res) {
    res.sendFile('/index.html', {root: __dirname + '/public/index'});
});

// GET '/admin'
app.get('/admin', function(req, res) {
    res.sendFile('./admin.html', {root: __dirname + '/public/admin'});
});

// GET '/student'
app.get('/student', function(req, res) {
    res.sendFile('./student.html', {root: __dirname + '/public/student'})
});

// GET /getAnswers
app.get('/getAnswers', function(req, res) {
    let sql = "SELECT questionID, optionID FROM questionoption WHERE isCorrect = 1"
    pool.query(sql, function(err, result) {
        if (err) {
            return console.error("Error executing the query", err.stack);
        } else {
            res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
            return res.end(JSON.stringify(result));
        }
    });
});

// POST /editQuestion
app.post('/editQuestion', function(req, res) {
    let sql1 = `UPDATE quizquestion SET question = "${req.body.questionText}" WHERE questionID = ${req.body.id}`;
    let sql2 = `UPDATE questionoption SET optionText = `

    // first query
    pool.query(sql1, function(err, result) {
        if (err) {
            return console.error("Error executing the query", err.stack);
        }
    });

    // need to do an synchronous loop for the second query
    async.each(req.body.options, function(element, cb) {
        let optionText = element.text;
        let isAnswer = element.isAnswer;
        let id = element.id;
        let sql = sql2 + `"${optionText}", isCorrect = ${isAnswer} WHERE optionID = ${id}`;
        pool.query(sql, function(err, result) {
            if (err) {
                return console.error("Error executing the query", err.stack);
            } else {
                cb();
            }
        });
    }, function(err) {
        if (err) {
            return console.error("Error", err);
        } else {
            // If all callbacks are returned with no error,
            res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
            return res.end("Successfully added this question to the quiz!");
        }
    });
    
});

// POST /newQuestion
app.post('/newQuestion', function(req, res) {
    let question = req.body.questionText;
    let quizQuestionSql = `INSERT INTO quizquestion(quizID, question) VALUES (4, "${question}")`;
    let questionIDSql = `SELECT questionID FROM quizquestion WHERE question = "${question}"`
    let questionOptionSql = `INSERT INTO questionoption(questionID, optionText, isCorrect) `

    // Inserting the question into quizquestion
    pool.query(quizQuestionSql, function(err, result) {
        if (err) {
            return console.error("Error executing the query", err.stack);
        }
        // obtaining the question ID
        pool.query(questionIDSql, function(err, result) {
            if (err) {
                return console.error("Error executing the query", err.stack);
            }
            let questionID = result[0].questionID;
            async.each(req.body.options, function(obj, cb) {
                let optionText = obj.text;
                let isAnswer = obj.isAnswer;
                let sql = questionOptionSql + `VALUES ("${questionID}", "${optionText}", ${isAnswer})`;
                pool.query(sql, function( err, result) {
                    if (err) {
                        return console.error("Error executing the query", err.stack);
                    }
                    cb();
                });
            }, function(err) {
                if (err) {
                    return console.error("Error", err.stack);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
                    return res.end("Successfully added this question to the quiz!");
                }
            });
        });
    });
});

// POST /deleteQuestion
app.post('/deleteQuestion', function(req, res) {
    console.log(req.body);
    let questionID = req.body.id;
    let quizQuestionSql = `DELETE FROM quizquestion WHERE questionID = ${questionID}`;
    let questionOptionSql = `DELETE FROM questionoption WHERE questionID = ${questionID}`;
    pool.query(questionOptionSql, function(err, result) {
        if (err) {
            return console.error("Error executing the query", err.stack);
        } else {
            pool.query(quizQuestionSql, function(err, result) {
                if (err) {
                    return console.error("Error executing the query", err.stack);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin' : '*'});
                    return res.end("Successfully deleted this question");
                }
            });
        }
    });
});

// GET: /getQuestions
app.get('/getQuestions', function(req, res) {
    let sql = 'SELECT * FROM quizquestion';
    let questionsArr = [];
    pool.query(sql, function(err, result) {
        if (err) {
            return console.error("Error executing the query", err.stack);
        } else {
            async.each(result, function(element, cb) {
                let question = {};
                question.text = element.question;
                question.id = element.questionID;
                let optionsSql = `SELECT * FROM questionoption WHERE questionID = ${element.questionID}`;
                pool.query(optionsSql, function(err, result) {
                    if (err) {
                        return console.error("Error executing the query", err.stack);
                    } else {
                        let optionsArr = [];
                        async.each(result, function(obj, cb) {
                            let option = {};
                            option.id = obj.optionID;
                            option.optionText = obj.optionText;
                            option.isCorrect = obj.isCorrect;
                            optionsArr.push(option);
                            cb();
                        }, function(err) {
                            if (err) {
                                return console.err("Error", err);
                            } else {
                                question.options = optionsArr;
                                questionsArr.push(question);
                                cb();
                            }
                        });
                    }
                });
            }, function(err) {
                if (err) {
                    return console.error("Error", err);
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                    console.log(JSON.stringify(questionsArr));
                    return(res.end(JSON.stringify(questionsArr)));
                    
                }
            });
            

        }
    });
});

app.listen(port, function() {
    console.log("App listening on port: " + port);
});