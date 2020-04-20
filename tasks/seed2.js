const sqlite3 = require('sqlite3').verbose();
let sqldb = new sqlite3.Database('db/dev');

sqldb.run("CREATE TABLE IF NOT EXISTS users \
            (id INTEGER PRIMARY KEY AUTOINCREMENT, \
             email TEXT, \
             password TEXT");

sqldb.run("CREATE TABLE IF NOT EXISTS checklists \
            (id INTEGER PRIMARY KEY AUTOINCREMENT, \
             author INTEGER, \
             title TEXT");

sqldb.run("CREATE TABLE IF NOT EXISTS items \
            (id INTEGER PRIMARY KEY AUTOINCREMENT, \
             list INTEGER, \
             text TEXT");
 

sqldb.run("INSERT INTO ")