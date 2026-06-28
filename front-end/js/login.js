const API_URL = "http://localhost:5000";

async function loginUser(){

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    if(!email || !password){
        alert("Please enter email and password");
        return;
    }

    const response = await fetch(`${API_URL}/login`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email,
            password:password
        })
    });

    const data = await response.json();

    alert(data.message);

    if(data.message === "Login Successful"){

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        window.location.href = "index.html";
    }

}