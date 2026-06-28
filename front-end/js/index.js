const API_URL = "http://localhost:5000";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

let allPosts = [];

if(userId){
    document.getElementById("loginLink").style.display = "none";
} else {
    document.getElementById("logoutBtn").style.display = "none";
}

if(role !== "admin"){
    document.getElementById("adminLink").style.display = "none";
}

async function loadPosts(){

    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();

    allPosts = posts;

    displayPosts(allPosts);

}

function displayPosts(posts){

    const container =
    document.getElementById("postsContainer");

    container.innerHTML = "";

    if(posts.length === 0){

        container.innerHTML = "<p>No blog posts found.</p>";
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

                    <div class="post-meta">
                        By ${post.author} | ${new Date(post.created_at).toLocaleDateString()}
                    </div>

                    <a class="read-btn" href="post.html?id=${post.id}">
                        Read More
                    </a>
                </div>
            </div>
        `;

    });

}

function filterPosts(){

    const searchValue =
    document.getElementById("searchInput").value.toLowerCase();

    const categoryValue =
    document.getElementById("categoryFilter").value;

    const filteredPosts = allPosts.filter(post => {

        const matchesSearch =
        post.title.toLowerCase().includes(searchValue) ||
        post.description.toLowerCase().includes(searchValue) ||
        post.content.toLowerCase().includes(searchValue) ||
        post.author.toLowerCase().includes(searchValue);

        const matchesCategory =
        categoryValue === "" || post.category === categoryValue;

        return matchesSearch && matchesCategory;

    });

    displayPosts(filteredPosts);

}

function logout(){

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";

}

loadPosts();