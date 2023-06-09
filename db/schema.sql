DROP DATABASE IF EXISTS employee_tracker_db
CREATE DATABASE employee_tracker_db

USE employee_tracker_db

CREATE TABLE department (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL
);

CREATE TABLE employee (
    id INT NOT NULL,
    first name VARCHAR(30) NOT NULL,
    last name VARCHAR(30) NOT NULl,
    role_id INT NOT NULL,
    manager_id INT NOT NULL
);