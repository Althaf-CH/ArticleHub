const API_URL = "https://articlehub-backend-vbaj.onrender.com/";

async function registerUser(){

    const username =
    document.getElementById("username").value;

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    if(!username || !email || !password){
        alert("Please fill all fields");
        return;
    }

    const response = await fetch(`${API_URL}/register`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            username:username,
            email:email,
            password:password
        })
    });

    const data = await response.json();

    alert(data.message);

    if(data.message === "Registration Successful"){
        window.location.href = "login.html";
    }

}