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