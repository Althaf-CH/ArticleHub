const API_URL = "https://articlehub-backend-vbaj.onrender.com";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

if(!userId){
    alert("Please login first");
    window.location.href = "login.html";
}

if(role !== "admin"){
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
}

async function loadAdminStats(){

    const response = await fetch(`${API_URL}/admin/stats`);
    const stats = await response.json();

    document.getElementById("totalUsers").innerText = stats.totalUsers;
    document.getElementById("totalPosts").innerText = stats.totalPosts;
    document.getElementById("totalComments").innerText = stats.totalComments;

}

async function loadUsers(){

    const response = await fetch(`${API_URL}/admin/users`);
    const users = await response.json();

    const container = document.getElementById("usersContainer");

    container.innerHTML = "";

    users.forEach(user => {

        container.innerHTML += `
            <div class="admin-row">
                <div><strong>${user.username}</strong></div>
                <div>${user.email}</div>
                <div>${user.role}</div>
                <div>User ID: ${user.id}</div>
            </div>
        `;

    });

}

async function loadPosts(){

    const response = await fetch(`${API_URL}/admin/posts`);
    const posts = await response.json();

    const container = document.getElementById("postsContainer");

    container.innerHTML = "";

    if(posts.length === 0){
        container.innerHTML = "<p>No posts found.</p>";
        return;
    }

    posts.forEach(post => {

        container.innerHTML += `
            <div class="admin-row">
                <div><strong>${post.title}</strong></div>
                <div>${post.category}</div>
                <div>By ${post.author}</div>
                <button class="admin-delete-btn" onclick="deletePost(${post.id})">
                    Delete
                </button>
            </div>
        `;

    });

}

async function loadComments(){

    const response = await fetch(`${API_URL}/admin/comments`);
    const comments = await response.json();

    const container = document.getElementById("commentsContainer");

    container.innerHTML = "";

    if(comments.length === 0){
        container.innerHTML = "<p>No comments found.</p>";
        return;
    }

    comments.forEach(comment => {

        container.innerHTML += `
            <div class="admin-row">
                <div><strong>${comment.username}</strong></div>
                <div>${comment.comment}</div>
                <div>${comment.post_title}</div>
                <button class="admin-delete-btn" onclick="deleteComment(${comment.id})">
                    Delete
                </button>
            </div>
        `;

    });

}

async function deletePost(postId){

    const confirmDelete = confirm("Delete this post?");

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

    alert(data.message);

    loadAdminStats();
    loadPosts();
    loadComments();

}

async function deleteComment(commentId){

    const confirmDelete = confirm("Delete this comment?");

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

    loadAdminStats();
    loadComments();

}

function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}

loadAdminStats();
loadUsers();
loadPosts();
loadComments();