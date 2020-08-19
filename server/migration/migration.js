const mysql = require('mysql');
const Database = require('better-sqlite3');
const db = new Database('flashcards.db', { verbose: console.log });

let currentDict;
let fieldNames = [];

//connection settings
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "gigafit",
    database: "dictionary"
});

//try to connect
con.connect(function (err) {
    if (err) throw err;
});

//get all entries
con.query("SELECT * FROM Entry ORDER BY Word", function (err, result, fields) {
    if (err) throw err;
    currentDict = result
    console.log(currentDict.length)
    describeTable()
});

// con.end();

function describeTable() {
    con.query("DESCRIBE entry", function (err, result, fields) {
        if (err) throw err;
        fieldNames.push("word")
        fieldNames.push("pronunciation")
        fieldNames.push("part_of_speech")
        fieldNames.push("definition")
        console.log(fieldNames)
        console.log(getEntries("vocab").length)
        // toSqlite()
    });
}

function testMigration() {
    openDatabase(() => {
        db.run(`SELECT rowid, * FROM vocab WHERE word = 'natty'`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            else {
                console.log(rows)
            }
        });
    })
}

function toSqlite() {
    deleteTable("vocab")
    addTable("vocab", fieldNames)
    currentDict.forEach(item => {
        addEntry("vocab", {
            word: item.Word,
            pronunciation: item.Pronunciation,
            part_of_speech: item.PartOfSpeech,
            definition: item.Definition
        })
    })
}

function openDatabase(callback) {
    db = new sqlite3.Database('flashcards.db', (err) => {
        if (err) {
            console.log(err.message)
        }
        else {
            console.log('Connected to the vocab database.')
            callback()
        }
    })
}

function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error(err.message)
        }
        console.log('Database connection closed.')
    })
}

function getTables(callback) {
    db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        else {
            callback(rows)
        }
    });
}

function addTable(name, columns, callback) {
    let cols = ''
    columns.forEach(col => {
        cols += col + " text,"
    });
    cols = cols.substring(0, cols.length - 1) // Cut off last comma
    try {
        db.exec(`CREATE TABLE ${name}(${cols})`)
    } catch (error) {
        console.log(error)
    }
}

function editTable(name, data) {
    db.run(`ALTER TABLE ${name} RENAME TO ${data.name};`)
}

function deleteTable(name) {
    try {
        db.exec(`DROP TABLE ${name}`)
    } catch (error) {
        console.log(error)
    }
}

// Get all entries in a table ordered by first column
function getEntries(table_name) {
    const stmt = db.prepare(`SELECT rowid, * FROM ${table_name} ORDER BY 1`)
    let rows
    try {
        rows = stmt.all()
    } catch (error) {
        console.log(error)
    }

    return rows

    // db.all(`SELECT rowid, * FROM ${table_name} ORDER BY 1`, [], (err, rows) => {
    //     if (err) {
    //         throw err;
    //     }
    //     else {
    //         callback(rows)
    //     }
    // });
}

function addEntry(table_name, data) {
    let cols = ''
    Object.keys(data).forEach(key => {
        if (key != "id") {
            cols += "@" + key + ","
        }
    });
    cols = cols.substring(0, cols.length - 1) // Cut off last comma

    let vals = ''
    Object.keys(data).forEach(key => {
        if (key != "id") {
            vals += "'" + data[key] + "',"
        }
    });
    vals = vals.substring(0, vals.length - 1) // Cut off last comma
    console.log()
    
    const stmt = db.prepare(`INSERT INTO ${table_name} VALUES (${cols})`)
    let info
    try {
        info = stmt.run(data)
    } catch (error) {
        console.log(error)
    }

    return info.lastInsertRowid
    
    // console.log(`INSERT INTO ${table_name} (${cols}) VALUES(${vals})`)
    // `INSERT INTO ?`
    // db.run(`INSERT INTO ${table_name} (${cols}) VALUES(${vals})`, [], function (err) {
    //     if (err) {
    //         return console.log(err.message);
    //     }
    //     // get the last insert id
    //     console.log(`A row has been inserted with rowid ${this.lastID}`);
    // });
}

function updateEntry(table_name, data) {
    let cols = ''
    Object.keys(data).forEach(key => {
        if (key != "id") {
            cols += key + " = '" + data[key] + "',"
        }
    });
    cols = cols.substring(0, cols.length - 1) // Cut off last comma
    console.log(`UPDATE ${table_name} SET ${cols} WHERE rowid = ${data.id};`)
    db.run(`UPDATE ${table_name} SET ${cols} WHERE rowid = ${data.id};`, [], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // log changes
        console.log("\nEdited entry (id = " + data.id + ") " + cols);
    });
}

function deleteEntry(table_name, id) {
    db.run(`DELETE FROM ${table_name} WHERE rowid = ${id};`, [], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // log changes
        console.log("\Deleted entry (id = " + data.id + ")");
    });
}

function updateDict() {
    for (var i = 0; i < vocab.length; i++) {
        var duplicate = false;
        for (var j = 0; j < currentDict.length; j++) {
            if (vocab[i].definition.replace(/'/g, '') == currentDict[j].Definition.replace(/'/g, '')) {
                duplicate = true;
            }
        }

        if (!duplicate) {
            axios.post(url, {
                Word: vocab[i].word,
                Pronunciation: vocab[i].pronunciation,
                PartOfSpeech: vocab[i].part_of_speech,
                Definition: vocab[i].definition
            })
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }
}

function prettify(sentence) {
    var words = sentence.split('_')
    console.log(words)
    for (let index = 0; index < words.length; index++) {
        words[index] = capitalizeFirstLetter(words[index])
    }

    return words.join(' ')
}

function capitalizeFirstLetter(word) {
    var letter = word.charAt(0)
    letter = letter.toUpperCase()
    word = word.substring(1, word.length)
    return letter + word
}