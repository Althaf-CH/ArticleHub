const API_URL = "https://articlehub-backend-vbaj.onrender.com";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

if(!userId){
    alert("Please login first");
    window.location.href = "login.html";
}

if(!postId){
    alert("Post not found");
    window.location.href = "index.html";
}

async function loadPostForEdit(){

    const response = await fetch(`${API_URL}/posts/${postId}`);
    const post = await response.json();

    if(String(post.user_id) !== String(userId) && role !== "admin"){
        alert("You are not allowed to edit this post");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("title").value = post.title;
    document.getElementById("category").value = post.category;
    document.getElementById("description").value = post.description;
    document.getElementById("image").value = post.image;
    document.getElementById("content").value = post.content;

}


async function updatePost(){

    const title =
    document.getElementById("title").value;

    const category =
    document.getElementById("category").value;

    const description =
    document.getElementById("description").value;

    const image =
    document.getElementById("image").value;

    const content =
    document.getElementById("content").value;

    if(!title || !category || !description || !content){
        alert("Please fill all required fields");
        return;
    }

    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            user_id:userId,
            role:role,
            title:title,
            category:category,
            description:description,
            image:image,
            content:content
        })
    });

    const data = await response.json();

    alert(data.message);

    if(data.message === "Post Updated Successfully"){
    window.location.href = "index.html";
}

}


function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}

loadPostForEdit();