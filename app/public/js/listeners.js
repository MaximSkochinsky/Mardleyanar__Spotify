

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.getAttribute('href'))
    handleLocation();
}

const buttonRoute = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.path[1].getAttribute('href'))
    handleLocation();
}


const logIn = async (event) => {
    console.log('here')
    event = event || window.event;
    event.preventDefault();

    const json = getJson(new FormData(document.forms.login));
    const data = await fetch('/content/login', 
    {
        method:'POST', 
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
    });
    const result = await data.text();
    if (result == "ERROR!") alert("Such user doesn't exists!");
    else  {
        json.user = result;
        addUser(json);
    }
    window.history.pushState({}, "", event.target.getAttribute('href'))
    handleLocation();
}


const signUp = async (event) => {
    console.log('here')
    event = event || window.event;
    event.preventDefault();

    const json = getJson(new FormData(document.forms.signup));

    if (json.email.length == 0 || json.user.length == 0 || json.password.length == 0) {
        alert('Error!!! Empty sign up data!!!')
        return
    }

    if (!validateEmail(json.email) || json.email.length > 20) {
        alert('No valid email!')
        return 
    }

    if (json.user.length > 20) {
        alert('No valid username!(length more than 20 symbols)');
        return;
    }

    const data = await fetch('/content/signup', 
    {
        method:'POST', 
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
    });
    const result = await data.text();

    if (result == "OK") {
        addUser(json)
    }
    else {
        alert('Such user already exists!');
    }
    window.history.pushState({}, "", event.target.getAttribute('href'))
    handleLocation();
}


const logOut = (event) => {
    localStorage.clear();
    window.location.assign('/');
}





setUserInfo = () => {
    if (window.location.pathname == '/account') {
        document.getElementById('username').innerHTML = localStorage.getItem("user");
        document.getElementById('email').innerHTML = localStorage.getItem("email");
    }    
    if (window.location.pathname == '/') {
        document.getElementById('greetings').innerHTML = `Welcome to my app, ${localStorage.getItem("user")}!`;
    }
    if (window.location.pathname == '/search') {
        document.getElementById('greetings').innerHTML = `Search for your favorite music`;
    }
   
    if (window.location.pathname == '/library') {
        document.getElementById('header-dark-text').innerHTML = `This is your own history, ${localStorage.getItem("user")}`;
    }
}


changeEmail = async (event) => {
    let newEmail = prompt("Set new email to user: ", "example@mail.ru");
    if (newEmail.length >= 15) {
        alert('Email cannot be larger that 15 symbols!')
        newEmail = localStorage.getItem("email")
    } 
    if (validateEmail(newEmail)) {
        let response = await fetch("/update/email", {
            method: 'POST',
            body: JSON.stringify({newEmail: newEmail, email: localStorage.getItem("email")}),
            headers: { "Content-Type": "application/json" }
        })
        let answer = await response.text();
        if ( answer == "OK") {
            localStorage.setItem("email", newEmail);      
            document.getElementById("email").innerHTML = localStorage.getItem("email");
        }
        else alert(answer)
    }
    else alert('New email cannot be empty and must look like email!')
    
}

