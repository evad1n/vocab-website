var express = require('express')
var cors = require('cors')
var mysql = require('mysql');
var app = express()
app.use(cors())
var port = 3000
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//connection settings
// Requires a mysql database 
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "database"
});

//try to connect
con.connect(function (err) {
    if (err) throw err;
});

//get all entries
app.get('/entry', function (req, res) {
    con.query("SELECT * FROM Entry ORDER BY Word", function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.send(result);
    });
})

//get first few entries to display
app.get('/entry/preload/:number', function (req, res) {
    con.query("SELECT * FROM Entry ORDER BY Word LIMIT " + req.params.number, function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.send(result);
    })
})

//get id for last word added
// Can't use this twice in a row or it freaks out...
app.get('/entry/id', function (req, res) {
    con.query("SELECT LAST_INSERT_ID()", function (err, result, fields) {
        if (err) throw err;
        console.log(result[0]["LAST_INSERT_ID()"]);
        res.send(result);
    })
})

//add new word
app.post('/entry', function (req, res) {
    var data = req.body;
    con.query(`insert into Entry (Word, Pronunciation, PartOfSpeech, Definition) values ("` + data.Word + `","` + data.Pronunciation + `","` + data.PartOfSpeech + `","` + data.Definition + `")`, function (err, result, fields) {
        if (err) throw err;
        process.stdout.write("\nAdded new word " + data.Word + " with id="); // Use process.stdout.write to remove newline
        res.send(result);
    });
    //    res.send("insert into Entry (Word, Pronunciation, PartOfSpeech, Definition) values ('" + data.Word + "','" + data.Pronunciation + "','" + data.PartOfSpeech + "','" + data.Definition + "')");
})

//edit a word
app.patch('/entry', function (req, res) {
    var data = req.body;
    con.query(`update Entry set Word = "` + data.newWord + `", Pronunciation = "` + data.newPronunciation + `", PartOfSpeech = "` + data.newPartOfSpeech + `", Definition = "` + data.newDefinition + `" where Id = ` + data.Id, function (err, result, fields) {
        if (err) throw err;
        console.log("\nEdited word (id = " + data.Id + ")",
            "\nfrom word: " + data.oldWord + ", pronunciation: " + data.oldPronunciation + ", part of speech: " + data.oldPartOfSpeech + ", definition: " + data.oldDefinition,
            "\nto word: " + data.newWord + ", pronunciation: " + data.newPronunciation + ", part of speech: " + data.newPartOfSpeech + ", definition: " + data.newDefinition);
        res.send(result);
    });
    //    res.send("update Entry set Word = '" + data.Word + "', Pronunciation = '" + data.Pronunciation + "', PartOfSpeech = '" + data.PartOfSpeech + "', Definition = '" + data.Definition + "' where Definition = '" + data.OldDefinition + "'");
})

//delete a word
app.delete('/entry', function (req, res) {
    con.query("delete from Entry where Id = " + req.body.Id, function (err, result, fields) {
        if (err) throw err;
        console.log("\ndeleted word '" + req.body.Word + "' where id=" + req.body.Id);
        res.send(result);
    });
    //    res.send("delete from Entry where Definition = '" + req.body.Definition + "'");
})

// describe table for migration
app.get('/entry/describe', function (req, res) {
    con.query("DESCRIBE entry", function (err, result, fields) {
        if (err) throw err;
        console.log(result, fields)
        res.send(result)
    })
})

app.listen(port, () => console.log(`Dictionary app listening on port ${port}!`))