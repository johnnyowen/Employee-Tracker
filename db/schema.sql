-- Droping and creating Database
DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

-- Using said Database
USE employee_tracker_db;

-- Creating the Tables
CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dep_name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT,
    -- Connects the tables 'department' and 'roles' by department ID
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    -- Deletes the roles if a department is deleted
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULl,
    role_id INT NOT NULL,
    manager_id INT,
    -- Connects the tables 'employee' and 'roles' by role ID
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    -- Deletes the employees if a role is deleted
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);