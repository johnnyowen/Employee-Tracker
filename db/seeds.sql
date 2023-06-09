INSERT INTO department (id, dep_name)
VALUES  (1, 'Management'),
        (2, 'Sales'),
        (3, 'IT'),
        (4, 'Accounting');

INSERT INTO roles (id, title, salary, department_id)
VALUES  (01, 'General Manager', 150000, 1),
        (02, 'Assiatant Manager', 120000, 1),
        (03, 'Sales Lead', 90000, 2),
        (04, 'Sales Representative', 75000, 2),
        (05, 'IT Lead', 100000, 3),
        (06, 'IT Technician', 85000, 3),
        (07, 'Accounting Lead', 95000, 4),
        (08, 'Accounting Assistant', 80000, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES  (001, 'Masayoshi', 'Takanaka', 01, null),
        (002, 'Fenne', 'Lily', 03, null),
        (003, 'DJ', 'Gigola', 05, null), 
        (004, 'Kev', 'Koko', 07, null),
        (005, 'Libby', 'Lux', 02, 001),
        (006, 'Lana', 'Del Rey', 04, 002),
        (007, 'James', 'Bond', 06, 003),
        (008, 'Gioli', 'Assia', 08, 004);