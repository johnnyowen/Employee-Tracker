INSERT INTO department (dep_name)
VALUES  ('Management'),
        ('Sales'),
        ('IT'),
        ('Accounting');

INSERT INTO roles (title, salary, department_id)
VALUES  ('General Manager', 150000, 1),
        ('Assiatant Manager', 120000, 1),
        ('Sales Lead', 90000, 2),
        ('Sales Representative', 75000, 2),
        ('IT Lead', 100000, 3),
        ('IT Technician', 85000, 3),
        ('Accounting Lead', 95000, 4),
        ('Accounting Assistant', 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ('Masayoshi', 'Takanaka', 1, null),
        ('Fenne', 'Lily', 3, null),
        ('DJ', 'Gigola', 5, null), 
        ('Kev', 'Koko', 7, null),
        ('Libby', 'Lux', 2, 1),
        ('Lana', 'Del Rey', 4, 2),
        ('James', 'Bond', 6, 3),
        ('Gioli', 'Assia', 8, 4);