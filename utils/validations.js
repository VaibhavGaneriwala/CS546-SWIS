// helper functions for input validation
export { validFirstName, validLastName, validEmail, validUsername, validPassword, createCurrentDateandTime, validProductName, validCategoryName, validQuantity, validMinThreshold, validUnitPrice, validRestockSuggestion };

function validFirstName(firstName) {

    if (!firstName === 'string' || firstName.trim() === '') throw new Error("First name must be a non-empty string");
    firstName = firstName.trim()
    const regex = /^[A-Za-z]{2,50}$/
    if (!regex.test(firstName)) throw new Error("First name must be 2-50 characters long, containing only letters");
    return firstName;
}

function validLastName(lastName) {
    if (!lastName === 'string' || lastName.trim() === '') throw new Error("Last name must be a non-empty string");
    lastName = lastName.trim()
    const regex = /^[A-Za-z]{2,50}$/
    if (!regex.test(lastName)) throw new Error("Last name must be 2-50 characters long, containing only letters");
    return lastName;
}

function validEmail(email) {
    if (!email === 'string' || email.trim() === '') throw new Error("Email must be a non-empty string");
    email = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) throw new Error("Invalid email address");
    return email;
}

function validUsername(username) {
    if (!username === 'string' || username.trim() === '') throw new Error("Username must be a non-empty string");
    username = username.trim().toLowerCase();
    const regex = /^[A-Za-z0-9_-]{3,20}$/
    if (!regex.test(username)) throw new Error("Username must be 3-20 characters long, containing only letters, numbers, hyphens, and underscores");
    return username;
}

function validPassword(password) {
    if (!password === 'string' || password.trim() === '') throw new Error("Password must be a non-empty string");
    password = password.trim();
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!regex.test(password)) throw new Error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    return password;
}

function createCurrentDateandTime() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function validProductName(name) {
    if (typeof name !== "string" || !name.trim()) throw new Error("Product Name must be a non-empty string");
    return name.trim()
}

function validCategoryName(name) {
    if (typeof name !== "string" || !name.trim()) throw new Error("Category Name must be a non-empty string");
    return name.trim().toLowerCase();
}

function validQuantity(quantity) {
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be an integer greater than or equal to 1");
    return quantity;
}

function validMinThreshold(minThreshold) {
    if (typeof minThreshold !== "number" || minThreshold < 0) throw new Error("Minimum Threshold must be a number greater than or equal to zero");
    return minThreshold;
}

function validUnitPrice(unitPrice) {
    if (typeof unitPrice !== "number" || unitPrice < 0) throw new Error('Invalid Unit Price');
    return Number(unitPrice.toFixed(2));
}

function validRestockSuggestion(restockSuggestion) {
    if (typeof restockSuggestion !== 'object' || Array.isArray(restockSuggestion) || restockSuggestion === null) throw new Error('Restock Suggestion must be of type object, and not an array');
    if (!typeof restockSuggestion.recommendedQty === "number" || restockSuggestion.recommendedQty < 0) throw new Error("Recommended Quantity must be a number greater than or equal to 0");

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(restockSuggestion.nextRestockDate)) throw new Error("Invalid restockSuggestion.nextRestockDate");

    const today = new Date()
    const selectedDate = new Date(restockSuggestion.nextRestockDate)

    //timezone adjustment
    selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset())

    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
        throw new Error("Restock date cant be in the past")
    }
    
    return restockSuggestion;
}