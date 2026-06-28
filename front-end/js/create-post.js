const API_URL = "http://localhost:5000";

const userId = localStorage.getItem("userId");

if(!userId){
    alert("Please login first");
    window.location.href = "login.html";
}

async function createPost(){

    const publishBtn =
    document.getElementById("publishBtn");

    const title =
    document.getElementById("title").value.trim();

    const category =
    document.getElementById("category").value;

    const description =
    document.getElementById("description").value.trim();

    const image =
    document.getElementById("image").value.trim();

    const content =
    document.getElementById("content").value.trim();

    if(!title || !category || !description || !content){
        alert("Please fill all required fields");
        return;
    }

    publishBtn.disabled = true;
    publishBtn.innerText = "Publishing...";

    const response = await fetch(`${API_URL}/posts`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            user_id:userId,
            title:title,
            category:category,
            description:description,
            image:image,
            content:content
        })
    });

    const data = await response.json();

    if(response.ok){

        alert(data.message || "Post Created Successfully");

        window.location.href = "index.html";

        return;

    }

    alert(data.message || "Something went wrong");

    publishBtn.disabled = false;
    publishBtn.innerText = "Publish Post";

}

function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}