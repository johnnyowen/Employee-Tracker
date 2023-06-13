// Calling upon the dependencies used
const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql2');
// To hide my password
require('dotenv').config();

// The ASCII Logo at the top created from info on the package.json
const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());

// Connecting to the SQL Database
const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'employee_tracker_db'
    },
    console.log(`Connected to employee_tracker_db`)
);

// Questions array that doesn't necessarily need to be an array but makes it easier to add questions if needed
const question = [{
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
        'Delete A Department',
        'Delete A Role',
        'Delete An Employee',
        'View Employees Under A Manager',
        'View Employeees In Department',
        'View Yearly Labor Budget Of A Department',
        'Exit']
}];

// Main function of the program
function runEmpTracker() { 
    inquirer.prompt(question)
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
        } else if (answer.what === 'Delete A Department') {
            deleteDepartment();
        } else if (answer.what === 'Delete A Role') {
            deleteRole();
        } else if (answer.what === 'Delete An Employee') {
            deleteEmployee();
        } else if (answer.what === 'View Employees Under A Manager') {
            viewByManager();
        } else if (answer.what === 'View Employeees In Department') {
            viewByDepartment();
        } else if (answer.what === 'View Yearly Labor Budget Of A Department') {
            viewLaborPerDepartment();
        } else if (answer.what === 'Exit') {
            console.log('You have exited Employee Tracker, goodbye!');
            process.exit();
        }
    });
};

// Function to view Departments
function viewAllDepartments() {
    console.log('Viewing All Departments');
    connection.query('SELECT * FROM department', (err, results) => {
            // Shows Table
            console.table(results);
            // Restarts inquirer after displaying the table
            runEmpTracker();
        }
      );
};

// Function to view Roles
function viewAllRoles() {
    console.log('Viewing All Roles');
    // Grabs just the information I want to display
    const sql = `SELECT roles.id, roles.title, roles.salary, department.dep_name AS department
    FROM roles
    JOIN department ON roles.department_id = department.id`
    connection.query(sql, (err, results) => {
        // Shows Table
        console.table(results); 
        // Runs it again
        runEmpTracker();
      }
    );
};

// Function to view Employees
function viewAllEmployees() {
    console.log('Viewing All Employees');
    // Uses JOIN to display all the things I want, CONCAT function displays manager name instead of number
    const sql = `SELECT employee.first_name, employee.last_name, roles.title, roles.salary, department.dep_name,
    CONCAT(e.first_name, ' ' ,e.last_name) AS Manager 
    FROM employee 
    INNER JOIN roles ON roles.id = employee.role_id 
    INNER JOIN department ON department.id = roles.department_id 
    LEFT JOIN employee e ON employee.manager_id = e.id;`
    connection.query(sql, (err, results) => {
        // Shows Table
        console.table(results); 
        // Runs it again
        runEmpTracker();
      }
    );
};

// Adding a new Department
function addDepartment() {
    // Asks for new department name
    inquirer.prompt({
        type: 'input',
        name: 'dept',
        message: 'What is the name of the new Department?'
    })
    // Creates new department
    .then((answer) => {
        connection.query('INSERT INTO department SET ?',{dep_name: answer.dept}, (err, results) => {
            // Shows updated Table
            viewAllDepartments();
            console.log('Successfully Added A Department');
        });
    });
};

// Adding a new Role
function addRole() {
    // First we fill an array with departments so the user can chose a department by name and role can be properly assigned by id 
    const departments = [];
    connection.query('SELECT * FROM department', (err, res) => {
        res.forEach(dep => {
            let depObj = {
                name: dep.dep_name,
                value: dep.id
            };
            departments.push(depObj);
        });
        // Questions about new Role
        inquirer.prompt([
                {
                type: 'input',
                name: 'roleTitle',
                message: 'What is the name of the new Role?'
            },{
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary of the new Role? HAS TO BE A NUMBER, NO $ NECESSARY'
            },{
                type: 'list',
                name: 'roleDep',
                message: 'What Department is the new Role in?',
                choices: departments
            }
        ])
        // Creates new Role
        .then((answer) => {
            connection.query('INSERT INTO roles SET ?', {title: answer.roleTitle, salary: answer.roleSalary, department_id: answer.roleDep}, (err, results) => {
                // Shows updated Table
                console.log(answer)
                viewAllRoles();
                console.log('Successfully Added A Role');
            });
        });
    });
};

// Adding an Employee
function addEmployee() {
    // First filling a managers array with manager objects so user can chose manager by name and the manager will be assigned by id, with there also being an option for no manager
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
        // Second we fill an array with departments so the user can chose a department by name and role can be properly assigned by id
        connection.query('SELECT * FROM roles', (err, roleRes) => {
            const roles = [];
            roleRes.forEach(({ title, id }) => {
                roles.push({
                    name: title,
                    value: id
                });
            });
            // Now we ask questions about the new Employee while properly assigning IDs
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
            // Creates Employee
            .then((answers) => {
                connection.query('INSERT INTO employee SET ?', {first_name: answers.empFirstName, last_name: answers.empLastName, role_id: answers.empRole, manager_id: answers.empManager}, (err, res) => {
                    // Shows updated Table
                    viewAllEmployees();
                    console.log('Successfully Added An Employee');
                });
            });
        });
    });
};

// Updating an Employee Role
function updateEmployeeRole() {
    connection.query('SELECT * FROM employee', (err, empRes) => {
        // First we create employees array
        const empChoice = [];
        empRes.forEach(({ first_name, last_name, id }) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        // Second we create a roles array
        connection.query('SELECT * FROM roles', (err, roleRes) => {
            const roles = [];
             roleRes.forEach(({ title, id }) => {
                roles.push({
                    name: title,
                    value: id
                });
             });
            //  Using these arrays we ask which amployee will be updated to which role
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
            // Updates the Role
             .then((answers) => {
                connection.query(`UPDATE employee SET role_id = ${answers.role} WHERE id = ${answers.employee}`, (err, res) => {
                    // Shows updated Table
                    viewAllEmployees();
                    console.log('Successfully Updated An Employee');
                });
             });
        });
    });
};

// Updating a manager
function updateEmployeeManager() {
    // First we create employees array that we can use for both questions here
    connection.query('SELECT * FROM employee', (err, empRes) => {
        const empChoice = [];
        empRes.forEach(({ first_name, last_name, id }) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        // We ask which employee has a new boss
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
        // And we update the table
        .then((answers) => {
            connection.query(`UPDATE employee SET manager_id = ${answers.newManager} WHERE id = ${answers.employee}`, () => {
                console.log('Successfully Updated The Manager For This Employee');
                // Shows updated Table
                viewAllEmployees();
            });
        });
    });
};

// Deletes a department, and per the schema.sql deletes roles assigned to that department, and employees in said roles
function deleteDepartment() {
    connection.query('SELECT * FROM department', (err, depRes) => {
        // Departments array for the choices
        const departments = [];
         depRes.forEach(({ dep_name, id }) => {
            departments.push({
                name: dep_name,
                value: id
            });
         });
        //  Asking the Q
         inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which Department would you like to DELETE?',
                choices: departments
            },{
                // A second question to make sure user understands what they are deleting
                type: 'list',
                name: 'AREYOUSURE',
                message: 'THIS WILL DELETE THIS DEPARTMENT, ALL ROLES ASSIGNED TO THIS DEPARTMENT, AND DELETE ALL EMPLOYEES ASSIGNED TO THOSE ROLES. IF YOU ARE NOT SURE WHAT ROLES OR WHICH EMPLOYEES ARE IN THIS DEPARTMENT, SELECT "NO" AND USE "VIEW ALL EMPLOYEES" TO SEE WHO IS IN WHAT ROLE, AND THE DEPARTMENTS THEY ARE IN. IF YOU ARE SURE ABOUT DELETION, SELECT "YES,..."',
                choices: ["NO", "YES, I  am sure I want to DELETE this DEPARTMENT, all ROLES and all EMPLOYEES in it"]
            }
        ])
        // Deletes the department, roles, and employees
         .then((answers) => {
            if (answers.AREYOUSURE === "NO") {
                runEmpTracker();
            } else {
                connection.query(`DELETE FROM department WHERE id = ${answers.department};`, (err, res) => {
                    // Shows updated Table
                    viewAllDepartments();
                    console.log('Successfully Deleted A Department');
                });
            };
         });
    });
};

// Deleting a Role
function deleteRole() {
    // Roles array for the choices
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
                name: 'role',
                message: 'Which role would you like to DELETE?',
                choices: roles
            },{
                // The double Check
                type: 'list',
                name: 'AREYOUSURE',
                message: 'THIS WILL DELETE THIS ROLE AND DELETE ALL EMPLOYEES ASSIGNED TO THIS ROLE. IF YOU ARE NOT SURE WHO IS IN THIS ROLE, SELECT "NO" AND USE "VIEW ALL EMPLOYEES" TO SEE WHO IS IN WHAT ROLE. IF YOU ARE SURE ABOUT DELETION, SELECT "YES,..."',
                choices: ["NO", "YES, I  am sure I want to DELETE this ROLE and all EMPLOYEES in it"]
            }
        ])
        // The result
         .then((answers) => {
            if (answers.AREYOUSURE === "NO") {
                runEmpTracker();
            } else {
                connection.query(`DELETE FROM roles WHERE id = ${answers.role};`, (err, res) => {
                    // Shows updated Table
                    viewAllRoles();
                    console.log('Successfully Deleted A Role');
                });
            };
         });
    });
};

// Deleting an employee
function deleteEmployee() {
    // Employees array
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
                },{
                    // This function isn't as destructive, but still good to make sure
                    type: 'list',
                    name: 'AREYOUSURE',
                    message: 'THIS WILL DELETE THIS EMPLOYEE. IF YOU ARE NOT SURE, SELECT "NO" AND USE THE PROMPTS TO DO SOMETHING ELSE. IF YOU ARE SURE ABOUT DELETION, SELECT "YES,..."',
                    choices: ["NO", "YES, I  am sure I want to DELETE this EMPLOYEE"]
                }
        ])
        // Results are in
        .then((answers) => {
            if (answers.AREYOUSURE === "NO") {
                runEmpTracker();
            } else {
                connection.query(`DELETE FROM employee WHERE id = ${answers.employee};`, (err, res) => {
                    // Shows updated Table
                    viewAllEmployees();
                    console.log('Successfully Deleted An Employee');
                });
            };
        });
    });
};

// So much writing!! This views all employees assigned to a manager
function viewByManager() {
    // First select all employees who are a manager
    connection.query(`SELECT * FROM employee
    WHERE manager_id IS NULL;`, (err, managerRes) => {
        const managerChoice = [];
        managerRes.forEach(({ first_name, last_name, id }) => {
            managerChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        // Ask who we are choosing to display workers under
        inquirer.prompt([
            {
                type: 'list',
                name: 'manager',
                message: 'Which Manager would you like to View the Employees of?',
                choices: managerChoice
            }
        ])
        // Show reaults
        .then((answers) => {
            connection.query(`SELECT CONCAT(e.first_name, ' ', e.last_name) AS Underlings
            FROM employee AS e
            WHERE e.manager_id = ${answers.manager};`, (err, res) => {
                // Shows Table
                console.table(res);
                runEmpTracker();
            })
        });
    });
};

// This views all employees assigned to a department, using the role_id and department_id
function viewByDepartment() {
    connection.query('SELECT * FROM department', (err, depRes) => {
        // Departments array for the choices
        const departments = [];
         depRes.forEach(({ dep_name, id }) => {
            departments.push({
                name: dep_name,
                value: id
            });
         });
         inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which Department would you like to View the Employees of?',
                choices: departments
            }
        ])
        // Joins all the tables so we can view the employees by department
        .then((answers) => {
            connection.query(`SELECT e.first_name, e.last_name, d.dep_name, r.title
            FROM employee AS e
            JOIN roles AS r ON e.role_id = r.id
            JOIN department AS d ON r.department_id = d.id
            WHERE d.id = ${answers.department}
            ORDER BY d.dep_name, e.last_name, e.first_name;`, (err, res) => {
                            // Shows Table
                            console.table(res);
                            runEmpTracker();
            })
        });
    });
};

// And finally we can view the total labor 
function viewLaborPerDepartment() {
    connection.query('SELECT * FROM department', (err, depRes) => {
        // Departments array for the choices
        const departments = [];
         depRes.forEach(({ dep_name, id }) => {
            departments.push({
                name: dep_name,
                value: id
            });
         });
         inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which Department would you like to View the Yearly Labor Budget(total of all employees salaries) of?',
                choices: departments
            }
        ])
        // Uses SUM to add salaries and JOINS to join tables, to view how expensive people are!
        .then((answers) => {
            connection.query(`SELECT d.dep_name, SUM(r.salary) AS total_salary
            FROM employee AS e
            JOIN roles AS r ON e.role_id = r.id
            JOIN department AS d ON r.department_id = d.id
            WHERE d.id = ${answers.department};`, (err, res) => {
                            // Shows Table
                            console.table(res);
                            runEmpTracker();
            })
        });
    });
};

// I should split this file up, maybe I will do that in the future

// Runs the inquirer
runEmpTracker();