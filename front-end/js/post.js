const API_URL = "https://articlehub-backend-vbaj.onrender.com";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

if(!postId){
    alert("Post not found");
    window.location.href = "index.html";
}

if(!userId){
    document.getElementById("commentBox").innerHTML =
    `
    <p>Please <a href="login.html">login</a> to comment.</p>
    `;
}
// Function to load the post details and comments
  async function loadPost(){

    const response =
    await fetch(`${API_URL}/posts/${postId}`);

    if(!response.ok){

        alert("This post no longer exists.");

        window.location.href = "index.html";

        return;

    }

    const post =
    await response.json();

    const container =
    document.getElementById("postContainer");

    let actionButtons = "";

    if(String(post.user_id) === String(userId) || role === "admin"){

        actionButtons = `
            <div class="post-actions">
                <button class="edit-btn" onclick="editPost()">
                    Edit Post
                </button>

                <button class="delete-btn" onclick="deletePost()">
                    Delete Post
                </button>
            </div>
        `;

    }

    container.innerHTML = `
        <img src="${post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643'}">

        <span class="category-badge">${post.category}</span>

        <h2>${post.title}</h2>

        <div class="single-meta">
            By ${post.author} | ${new Date(post.created_at).toLocaleDateString()}
        </div>

        <p>${post.description}</p>

        <div class="single-content">
            ${post.content}
        </div>

        ${actionButtons}
    `;

}


async function loadComments(){

    const response = await fetch(`${API_URL}/comments/${postId}`);
    const comments = await response.json();

    const container =
    document.getElementById("commentsContainer");

    container.innerHTML = "";

    if(comments.length === 0){

        container.innerHTML = "<p>No comments yet. Be the first to comment.</p>";
        return;

    }

    comments.forEach(comment => {

    let deleteButton = "";

    if(String(comment.user_id) === String(userId) || role === "admin"){

        deleteButton = `
            <button class="comment-delete-btn" onclick="deleteComment(${comment.id})">
                Delete Comment
            </button>
        `;

    }

    container.innerHTML += `
        <div class="comment-card">
            <h4>${comment.username}</h4>

            <p>${comment.comment}</p>

            <div class="comment-date">
                ${new Date(comment.created_at).toLocaleString()}
            </div>

            ${deleteButton}
        </div>
    `;

});

}


async function addComment(){

    const commentText =
    document.getElementById("commentText").value;

    if(!userId){
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    if(!commentText){
        alert("Please write a comment");
        return;
    }

    const response = await fetch(`${API_URL}/comments`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            post_id:postId,
            user_id:userId,
            comment:commentText
        })
    });

    const data = await response.json();

    alert(data.message);

    document.getElementById("commentText").value = "";

    loadComments();

}

async function deleteComment(commentId){

    const confirmDelete =
    confirm("Are you sure you want to delete this comment?");

    if(!confirmDelete){
        return;
    }

    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method:"DELETE",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            user_id:userId,
            role:role
        })
    });

    const data = await response.json();

    alert(data.message);

    if(data.message === "Comment Deleted Successfully"){
        loadComments();
    }

}
function editPost(){

    window.location.href = `edit-post.html?id=${postId}`;

}


async function deletePost(){

    const confirmDelete =
    confirm("Are you sure you want to delete this post?");

    if(!confirmDelete){
        return;
    }

    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method:"DELETE",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            user_id:userId,
            role:role
        })
    });

    const data = await response.json();

    if(data.message === "Post Deleted Successfully"){

    alert(data.message);

    window.location.replace("index.html");

    return;

}
}


function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}

loadPost();
loadComments();