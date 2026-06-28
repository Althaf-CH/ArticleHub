const API_URL = "https://articlehub-backend-vbaj.onrender.com/";

const username = localStorage.getItem("username");
const userId = localStorage.getItem("userId");

if(!userId){
    alert("Please login first");
    window.location.href = "login.html";
}

document.getElementById("welcomeText").innerText =
`Welcome, ${username}`;

async function loadDashboardStats(){

    const response =
    await fetch(`${API_URL}/dashboard/${userId}`);

    const stats =
    await response.json();

    document.getElementById("totalPosts").innerText =
    stats.totalPosts;

    document.getElementById("totalComments").innerText =
    stats.totalComments;

    document.getElementById("commentsReceived").innerText =
    stats.commentsReceived;

}

async function loadMyPosts(){

    const response =
    await fetch(`${API_URL}/user-posts/${userId}`);

    const posts =
    await response.json();

    const container =
    document.getElementById("myPostsContainer");

    container.innerHTML = "";

    if(posts.length === 0){

        container.innerHTML = "<p>You have not created any posts yet.</p>";
        return;

    }

    posts.forEach(post => {

        container.innerHTML += `
            <div class="post-card">
                <img src="${post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643'}">

                <div class="post-content">
                    <span class="category-badge">${post.category}</span>

                    <h3>${post.title}</h3>

                    <p>${post.description}</p>

                    <div class="small-info">
                        ${post.comment_count} comments
                    </div>

                    <div class="post-meta">
                        Posted on ${new Date(post.created_at).toLocaleDateString()}
                    </div>

                    <a class="read-btn" href="post.html?id=${post.id}">
                        View Post
                    </a>
                </div>
            </div>
        `;

    });

}

function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}

loadDashboardStats();
loadMyPosts();