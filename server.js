const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());


const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'employee_tracker_db'
    },
    console.log(`Connected to employee_tracker_db`)
);

const questions = [{
    type: "list",
    name: "what",
    message: "What would you like to do?",
    choices: [
        'View All Departments', 
        'View All Roles', 
        'View All Employees', 
        'Add A Department', 
        'Add A Role', 
        'Add An Employee', 
        'Update An Employee Role', 
        'Update An Employee Manager',
        'Delete An Employee',
        'Exit']
}];

function runEmpTracker() { 
    inquirer.prompt(questions)
    .then((answer) => {
        if (answer.what === 'View All Departments') {
            viewAllDepartments();
        } else if (answer.what === 'View All Roles') {
            viewAllRoles();
        } else if (answer.what === 'View All Employees') {
            viewAllEmployees();
        } else if (answer.what === 'Add A Department') {
            addDepartment();
        } else if (answer.what === 'Add A Role') {
            addRole();
        } else if (answer.what === 'Add An Employee') {
            addEmployee();
        } else if (answer.what === 'Update An Employee Role') {
            updateEmployeeRole();
        } else if (answer.what === 'Update An Employee Manager') {
            updateEmployeeManager();
        } else if (answer.what === 'Delete An Employee') {
            deleteEmployee();
        } else if (answer.what === 'Exit') {
            console.log('You have exited Employee Tracker, goodbye!');
            process.exit();
        }
    });
};

function viewAllDepartments() {
    console.log('Viewing All Departments');
    connection.query('SELECT * FROM department', (err, results) => {
            console.table(results);
            runEmpTracker();
        }
      );
};

function viewAllRoles() {
    console.log('Viewing All Roles');
    const sql = `SELECT roles.id, roles.title, roles.salary, department.dep_name AS department
FROM roles
JOIN department ON roles.department_id = department.id`
    connection.query(sql, (err, results) => {
        console.table(results); 
        runEmpTracker();
      }
    );
};

function viewAllEmployees() {
    console.log('Viewing All Employees');
    const sql = `SELECT employee.first_name, employee.last_name, roles.title, roles.salary, department.dep_name, 
CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
FROM employee 
INNER JOIN roles ON roles.id = employee.role_id 
INNER JOIN department ON department.id = roles.department_id 
LEFT JOIN employee e ON employee.manager_id = e.id;`
    connection.query(sql, (err, results) => {
        console.table(results); 
        runEmpTracker();
      }
    );
};

function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'dept',
        message: 'What is the name of the new Department?'
    })
    .then((answer) => {
        connection.query('INSERT INTO department SET ?',{dep_name: answer.dept}, (err, results) => {
            viewAllDepartments();
            console.log('Successfully Added A Department');
        });
    });
};

function addRole() {
    const departments = [];
    connection.query('SELECT * FROM department', (err, res) => {
        res.forEach(dep => {
            let depObj = {
                name: dep.dep_name,
                value: dep.id
            };
            departments.push(depObj);
        });
        inquirer.prompt([
                {
                type: 'input',
                name: 'roleTitle',
                message: 'What is the name of the new Role?'
            },{
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary of the new Role?'
            },{
                type: 'list',
                name: 'roleDep',
                message: 'What Department is the new Role in?',
                choices: departments
            }
        ])
        .then((answer) => {
            connection.query('INSERT INTO roles SET ?',{title: answer.roleTitle, salary: answer.roleSalary, department_id: answer.roleDep}, (err, results) => {
                viewAllRoles();
                console.log('Successfully Added A Role');
            });
        });
    });
};

function addEmployee() {
    connection.query('SELECT * FROM employee', (err, empRes) =>{
        const managers = [
            {
                name:'None',
                value: 0
            }
        ];
        empRes.forEach(({ first_name, last_name, id }) => {
            managers.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        connection.query('SELECT * FROM roles', (err, roleRes) => {
            const roles = [];
            roleRes.forEach(({ title, id }) => {
                roles.push({
                    name: title,
                    value: id
                });
            });
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'empFirstName',
                    message: 'What is the first name of the added Employee?'
                },{
                    type: 'input',
                    name: 'empLastName',
                    message: 'What is the last name of the added Employee?'
                },{
                    type: 'list',
                    name: 'empRole',
                    message: 'What is the role of the added Employee?',
                    choices: roles
                },{
                    type: 'list',
                    name: 'empManager',
                    message: 'Who is the manager of the added Employee if applicable?',
                    choices: managers
                }
            ])
            .then((answers) => {
                connection.query('INSERT INTO employee SET ?', {first_name: answers.empFirstName, last_name: answers.empLastName, role_id: answers.empRole, manager_id: answers.empManager}, (err, res) => {
                    viewAllEmployees();
                    console.log('Successfully Added An Employee');
                });
            });
        });
    });
};

function updateEmployeeRole() {
    connection.query('SELECT * FROM employee', (err, empRes) => {
        const empChoice = [];
        empRes.forEach(({ first_name, last_name, id }) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        connection.query('SELECT * FROM roles', (err, roleRes) => {
            const roles = [];
             roleRes.forEach(({ title, id }) => {
                roles.push({
                    name: title,
                    value: id
                });
             });
             inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which Employee would you like to update?',
                    choices: empChoice
                },{
                    type: 'list',
                    name: 'role',
                    message: 'What new role does this Employee have?',
                    choices: roles
                }
             ])
             .then((answers) => {
                connection.query(`UPDATE employee SET role_id = ${answers.role} WHERE id = ${answers.employee}`, (err, res) => {
                    viewAllEmployees();
                    console.log('Successfully Updated An Employee');
                });
             });
        });
    });
};

function updateEmployeeManager() {
    connection.query('SELECT * FROM employee', (err, empRes) => {
        const empChoice = [];
        empRes.forEach(({ first_name, last_name, id }) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which Employee has a new Manager?',
                choices: empChoice
            },{
                type: 'list',
                name: 'newManager',
                message: 'Who is the new Manager of this Employee?',
                choices: empChoice
            }
        ])
        .then((answers) => {
            connection.query(`UPDATE employee SET manager_id = ${answers.newManager} WHERE id = ${answers.employee}`, () => {
                console.log('Successfully Updated The Manager For This Employee');
                viewAllEmployees();
            });
        });
    });
};

function deleteEmployee() {
    connection.query('SELECT * FROM employee', (err, empRes) => {
        const empChoice = [];
        empRes.forEach(({ first_name, last_name, id }) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which Employee would you like to DELETE?',
                    choices: empChoice
                }
            ])
        .then((answers) => {
            connection.query(`DELETE FROM employee WHERE id = ${answers.employee};`, (err, res) => {
                viewAllEmployees();

            });
        });
    });
};

runEmpTracker();