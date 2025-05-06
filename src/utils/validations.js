// helper functions for input validation
export {validFirstName, validLastName};

function validFirstName(firstName){

    if (!firstName === 'string' || firstName.trim() === '') throw new Error("First name must be a non-empty string");
    firstName = firstName.trim();
    const regex = /^[A-Za-z]{2,50}$/
    if (!regex.test(firstName)) throw new Error("First name must be 2-50 characters long, containing only letters");
    return firstName;
}

function validLastName(lastName){
    if (!lastName === 'string' || lastName.trim() === '') throw new Error("Last name must be a non-empty string");
    lastName = lastName.trim();
    const regex = /^[A-Za-z]{2,50}$/
    if (!regex.test(lastName)) throw new Error("Last name must be 2-50 characters long, containing only letters");
    return lastName;
}

function validEmail(email){
    if (!email === 'string' || email.trim() === '') throw new Error("Email must be a non-empty string");
    email = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) throw new Error("Invalid email address");
    return email;
}

function validUsername(username){
    if (!username === 'string' || username.trim() === '') throw new Error("Username must be a non-empty string");
    username = username.trim().toLowerCase();
    const regex = /^[A-Za-z0-9]{3,20}$/
    if (!regex.test(username)) throw new Error("Username must be 3-20 characters long, containing only letters and numbers");
    return username;
}

function validPassword(password){
    if (!password === 'string' || password.trim() === '') throw new Error("Password must be a non-empty string");
    password = password.trim();
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!regex.test(password)) throw new Error("Password must be at least 8 characters long, containing at least one letter and one number");
    return password;
}
