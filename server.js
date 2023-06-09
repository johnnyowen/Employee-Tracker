const cTable = require('console.table');
const inquier = require('inquirer');
const mysql = require('mysql');
const asciiart = require('asciiart-logo')
require('dotenv').config();

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'employee_tracker_db'
    },
    console.log(`Connected to employee_tracker_db`)
)