const sqlite3 = require('sqlite3').verbose()

let db

module.exports = function openDatabase(callback) {
    db = new sqlite3.Database('./flashcards.db', (err) => {
        if (err) {
            console.log(err.message)
        }
        else {
            console.log('Connected to the vocab database.')
            callback()
        }
    })
}

module.exports = function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error(err.message)
        }
        console.log('Database connection closed.')
    })
}

module.exports = function getTables(callback) {
    db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        else {
            callback(rows)
        }
    });
}

module.exports = function addTable(name, columns) {
    let cols = ''
    columns.forEach(col => {
        cols += col + " text,"
    });
    cols = cols.substring(0, cols.length - 1) // Cut off last comma
    db.run(`CREATE TABLE ${name}(${cols})`);
}

module.exports = function editTable(name, data) {
    db.run(`ALTER TABLE ${name} RENAME TO ${data.name};`)
}

module.exports = function deleteTable(name) {
    db.run(`DROP TABLE ${name}`);
}

// Get all entries in a table ordered by first column
module.exports = function getEntries(table_name, callback) {
    db.all(`SELECT rowid, * FROM ${table_name} ORDER BY 1`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        else {
            callback(rows)
        }
    });
}

function addEntry(table_name, data) {
    let cols = ''
    Object.keys(data).forEach(key => {
        if (key != "id") {
            cols += key + ","
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

    console.log(`INSERT INTO ${table_name} (${cols}) VALUES(${vals})`)
    db.run(`INSERT INTO ${table_name} (${cols}) VALUES(${vals})`, [], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
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