const signupForm = document.getElementById('signup-form')
const loginForm = document.getElementById('loginForm')
const errorParagraph = document.getElementById('error')

function validName(name){
    return /^[A-Za-z]{2,20}$/.test(name)
}

function validUsername(username){
    username = username.trim()
    return /^[a-z0-9]{5,20}$/.test(username)
}

function validPassword(password){
    return (
        !/\s/.test(password) &&
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\]/.test(password)
    )
}

function validEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validPhone(phone){
    return /^\+?[0-9]{10,15}$/.test(phone)
}

function validZip(zip){
    return /^\d{5}(-\d{4})?$/.test(zip)
}

if(signupForm){
    signupForm.addEventListener('submit', (event) => {
        errorParagraph.innerHTML = ""
        errorParagraph.hidden = true

        const firstName = document.getElementById('firstName').value.trim()
        const lastName = document.getElementById('lastName').value.trim()
        const email = document.getElementById('email').value.trim()
        const username = document.getElementById('username').value.trim()
        const password = document.getElementById('password').value
        const confirmPassword = document.getElementById('confirmPassword').value
        const profilePicture = document.getElementById('profilePicture').value.trim()
        const phone = document.getElementById('phone').value.trim()

        const street = document.getElementById('street').value.trim()
        const city = document.getElementById('city').value.trim()
        const state = document.getElementById('state').value.trim()
        const zip = document.getElementById('zip').value.trim()

        const roleid = document.getElementById('roleid').value.trim()
        const roleName = document.getElementById('roleName').value.trim().toLowerCase()

        let errorMessages = []

        if(!validName(firstName)){
            errorMessages.push("First name must be 2-20 letters.")
        }
        if(!validName(lastName)){
            errorMessages.push("Last name must be 2-20 letters.")
        }
        if(!validEmail(email)){
            errorMessages.push("Invalid email format.")
        }
        if(!validUsername(username)){
            errorMessages.push("Username must be 5-20 lowercase letters or numbers.")
        } 
        if(!validPassword(password)){
            errorMessages.push("Password must be at least 8 characters, include uppercase, number, and special character.")
        } 
        if(password !== confirmPassword){
            errorMessages.push("Passwords do not match.")
        } 
        if(!profilePicture.toLowerCase().endsWith('.png')){
            errorMessages.push("Profile picture must be a .png file.")
        } 
        if(!validPhone(phone)){
            errorMessages.push("Phone number must be 10–15 digits, optional +.")
        } 

        if(!street || !city || !state || !zip){
            errorMessages.push("All address fields are required.")
        }else{
            if(!validZip(zip)) errorMessages.push("Invalid zip code format.")
        }

        if(!roleid){
            errorMessages.push("Role ID is required.")
        } 
        if(!['admin', 'superuser', 'user'].includes(roleName)){
            errorMessages.push("Role name must be 'admin', 'superuser', or 'user'.")
        }

        if(errorMessages.length > 0){
            event.preventDefault()
            errorParagraph.innerHTML = errorMessages.join(' ')
            errorParagraph.hidden = false
        }
    })
}

if(loginForm){
    loginForm.addEventListener('submit', (event) => {
        errorParagraph.innerHTML = ""
        errorParagraph.hidden = true
        const username = document.getElementById('username').value.trim()
        const password = document.getElementById('password').value

        let errorMessages = []

        if(!validUsername(username)){
            errorMessages.push("Username must be 5–20 lowercase letters or numbers.")
        }
        if(!validPassword(password)){
            errorMessages.push("Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.")
        }

        if(errorMessages.length > 0){
            event.preventDefault()
            errorParagraph.innerHTML = errorMessages.join(' ')
            errorParagraph.hidden = false
        }
    })
}
