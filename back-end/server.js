const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("database.db");

const PORT = process.env.PORT || 5000;

// Create Tables

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )
`);

db.run(
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
    (err) => {
        if(err){
            console.log("Role column already exists or cannot be added");
        } else {
            console.log("Role column added successfully");
        }
    }
);

    db.run(`
        CREATE TABLE IF NOT EXISTS posts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            category TEXT,
            description TEXT,
            content TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS comments(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

});

// Test Route

app.get("/", (req, res) => {

    res.send("ArticleHub Backend Running");

});

// Register User

app.post("/register", async (req, res) => {

    const {
        username,
        email,
        password
    } = req.body;

    if(!username || !email || !password){

        return res.status(400).json({
            message:"All fields are required"
        });

    }

    const hashedPassword =
    await bcrypt.hash(password, 10);

    const role =
email === "admin@gmail.com" ? "admin" : "user";

db.run(
    `
    INSERT INTO users
    (username, email, password, role)
    VALUES (?, ?, ?, ?)
    `,
    [
        username,
        email,
        hashedPassword,
        role
    ],

        function(err){

            if(err){

    console.log(err.message);

    if(err.message.includes("UNIQUE")){
        return res.status(400).json({
            message:"Email already exists"
        });
    }

    return res.status(500).json({
        message:err.message
    });

}

            res.json({
                message:"Registration Successful"
            });

        }
    );

});

// Login User

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if(!email || !password){

        return res.status(400).json({
            message:"Email and password required"
        });

    }

    db.get(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email],

        async (err, user) => {

            if(err){

                return res.status(500).json(err);

            }

            if(!user){

                return res.status(404).json({
                    message:"User not found"
                });

            }

            const match =
            await bcrypt.compare(
                password,
                user.password
            );

            if(!match){

                return res.status(401).json({
                    message:"Invalid password"
                });

            }

            res.json({
                message:"Login Successful",
                userId:user.id,
                username:user.username,
                role:user.role
            });

        }
    );

});
// Create Blog Post
app.post("/posts", (req, res) => {

    const {
        user_id,
        title,
        category,
        description,
        content,
        image
    } = req.body;

    if(!user_id || !title || !category || !description || !content){

        return res.status(400).json({
            message:"All required fields must be filled"
        });

    }

    db.run(
        `
        INSERT INTO posts
        (
            user_id,
            title,
            category,
            description,
            content,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            user_id,
            title,
            category,
            description,
            content,
            image
        ],

        function(err){

            if(err){

                return res.status(500).json(err);

            }

            res.json({
                message:"Post Created Successfully",
                postId:this.lastID
            });

        }
    );

});
//
// Get All Blog Posts

app.get("/posts", (req, res) => {

    db.all(
        `
        SELECT 
            posts.id,
            posts.title,
            posts.category,
            posts.description,
            posts.content,
            posts.image,
            posts.created_at,
            users.username AS author
        FROM posts
        JOIN users
        ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
        `,
        [],
        (err, posts) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(posts);

        }
    );

});
 // Get Single Blog Post

app.get("/posts/:id", (req, res) => {

    const postId = req.params.id;

    db.get(
        `
        SELECT 
            posts.id,
            posts.user_id,
            posts.title,
            posts.category,
            posts.description,
            posts.content,
            posts.image,
            posts.created_at,
            users.username AS author
        FROM posts
        JOIN users
        ON posts.user_id = users.id
        WHERE posts.id = ?
        `,
        [postId],
        (err, post) => {

            if(err){
                return res.status(500).json(err);
            }

            if(!post){
                return res.status(404).json({
                    message:"Post not found"
                });
            }

            res.json(post);

        }
    );

});
// Add Comment

app.post("/comments", (req, res) => {

    const {
        post_id,
        user_id,
        comment
    } = req.body;

    if(!post_id || !user_id || !comment){

        return res.status(400).json({
            message:"Comment cannot be empty"
        });

    }

    db.run(
        `
        INSERT INTO comments
        (
            post_id,
            user_id,
            comment
        )
        VALUES (?, ?, ?)
        `,
        [
            post_id,
            user_id,
            comment
        ],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"Comment Added"
            });

        }
    );

});


// Get Comments For A Post

app.get("/comments/:postId", (req, res) => {

    const postId = req.params.postId;

    db.all(
        `
        SELECT 
            comments.id,
            comments.post_id,
            comments.user_id,
            comments.comment,
            comments.created_at,
            users.username
        FROM comments
        JOIN users
        ON comments.user_id = users.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at DESC
        `,
        [postId],

        (err, comments) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(comments);

        }
    );

});
// Update Blog Post

app.put("/posts/:id", (req, res) => {

    const postId = req.params.id;

    const {
        user_id,
        role,
        title,
        category,
        description,
        content,
        image
    } = req.body;

    if(!title || !category || !description || !content){

        return res.status(400).json({
            message:"All required fields must be filled"
        });

    }

    db.get(
        "SELECT * FROM posts WHERE id = ?",
        [postId],
        (err, post) => {

            if(err){
                return res.status(500).json(err);
            }

            if(!post){
                return res.status(404).json({
                    message:"Post not found"
                });
            }

            if(post.user_id != user_id && role !== "admin"){
                return res.status(403).json({
                    message:"You are not allowed to edit this post"
                });
            }

            db.run(
                `
                UPDATE posts
                SET title = ?,
                    category = ?,
                    description = ?,
                    content = ?,
                    image = ?
                WHERE id = ?
                `,
                [
                    title,
                    category,
                    description,
                    content,
                    image,
                    postId
                ],

                function(err){

                    if(err){
                        return res.status(500).json(err);
                    }

                    res.json({
                        message:"Post Updated Successfully"
                    });

                }
            );

        }
    );

});


// Delete Blog Post

app.delete("/posts/:id", (req, res) => {

    const postId = req.params.id;

    const {
        user_id,
        role
    } = req.body;

    db.get(
        "SELECT * FROM posts WHERE id = ?",
        [postId],
        (err, post) => {

            if(err){
                return res.status(500).json(err);
            }

            if(!post){
                return res.status(404).json({
                    message:"Post not found"
                });
            }

            if(post.user_id != user_id && role !== "admin"){
                return res.status(403).json({
                    message:"You are not allowed to delete this post"
                });
            }

            db.run(
                "DELETE FROM comments WHERE post_id = ?",
                [postId],
                function(err){

                    if(err){
                        return res.status(500).json(err);
                    }

                    db.run(
                        "DELETE FROM posts WHERE id = ?",
                        [postId],
                        function(err){

                            if(err){
                                return res.status(500).json(err);
                            }

                            res.json({
                                message:"Post Deleted Successfully"
                            });

                        }
                    );

                }
            );

        }
    );

});
// Delete Comment

app.delete("/comments/:id", (req, res) => {

    const commentId = req.params.id;

    const {
        user_id,
        role
    } = req.body;

    db.get(
        "SELECT * FROM comments WHERE id = ?",
        [commentId],
        (err, comment) => {

            if(err){
                return res.status(500).json(err);
            }

            if(!comment){
                return res.status(404).json({
                    message:"Comment not found"
                });
            }

            if(comment.user_id != user_id && role !== "admin"){
                return res.status(403).json({
                    message:"You are not allowed to delete this comment"
                });
            }

            db.run(
                "DELETE FROM comments WHERE id = ?",
                [commentId],
                function(err){

                    if(err){
                        return res.status(500).json(err);
                    }

                    res.json({
                        message:"Comment Deleted Successfully"
                    });
                }
            );

        }
    );

});

// Get Dashboard Stats

app.get("/dashboard/:userId", (req, res) => {

    const userId = req.params.userId;

    db.get(
        "SELECT COUNT(*) AS totalPosts FROM posts WHERE user_id = ?",
        [userId],
        (err, postResult) => {

            if(err){
                return res.status(500).json(err);
            }

            db.get(
                "SELECT COUNT(*) AS totalComments FROM comments WHERE user_id = ?",
                [userId],
                (err, commentResult) => {

                    if(err){
                        return res.status(500).json(err);
                    }

                    db.get(
                        `
                        SELECT COUNT(comments.id) AS commentsReceived
                        FROM comments
                        JOIN posts
                        ON comments.post_id = posts.id
                        WHERE posts.user_id = ?
                        `,
                        [userId],
                        (err, receivedResult) => {

                            if(err){
                                return res.status(500).json(err);
                            }

                            res.json({
                                totalPosts:postResult.totalPosts,
                                totalComments:commentResult.totalComments,
                                commentsReceived:receivedResult.commentsReceived
                            });

                        }
                    );

                }
            );

        }
    );

});


// Get Posts Created By Logged User

app.get("/user-posts/:userId", (req, res) => {

    const userId = req.params.userId;

    db.all(
        `
        SELECT 
            posts.id,
            posts.title,
            posts.category,
            posts.description,
            posts.content,
            posts.image,
            posts.created_at,
            users.username AS author,
            COUNT(comments.id) AS comment_count
        FROM posts
        JOIN users
        ON posts.user_id = users.id
        LEFT JOIN comments
        ON comments.post_id = posts.id
        WHERE posts.user_id = ?
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
        `,
        [userId],
        (err, posts) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(posts);

        }
    );

});

// Admin Stats

app.get("/admin/stats", (req, res) => {

    db.get("SELECT COUNT(*) AS totalUsers FROM users", [], (err, users) => {

        if(err){
            return res.status(500).json(err);
        }

        db.get("SELECT COUNT(*) AS totalPosts FROM posts", [], (err, posts) => {

            if(err){
                return res.status(500).json(err);
            }

            db.get("SELECT COUNT(*) AS totalComments FROM comments", [], (err, comments) => {

                if(err){
                    return res.status(500).json(err);
                }

                res.json({
                    totalUsers:users.totalUsers,
                    totalPosts:posts.totalPosts,
                    totalComments:comments.totalComments
                });

            });

        });

    });

});


// Admin Get Users

app.get("/admin/users", (req, res) => {

    db.all(
        `
        SELECT id, username, email, role
        FROM users
        ORDER BY id DESC
        `,
        [],
        (err, users) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(users);

        }
    );

});


// Admin Get All Posts

app.get("/admin/posts", (req, res) => {

    db.all(
        `
        SELECT 
            posts.id,
            posts.title,
            posts.category,
            posts.created_at,
            users.username AS author
        FROM posts
        JOIN users
        ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
        `,
        [],
        (err, posts) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(posts);

        }
    );

});


// Admin Get All Comments

app.get("/admin/comments", (req, res) => {

    db.all(
        `
        SELECT 
            comments.id,
            comments.comment,
            comments.created_at,
            users.username,
            posts.title AS post_title
        FROM comments
        JOIN users
        ON comments.user_id = users.id
        JOIN posts
        ON comments.post_id = posts.id
        ORDER BY comments.created_at DESC
        `,
        [],
        (err, comments) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(comments);

        }
    );

});

app.listen(PORT, () => {

    console.log(`Server Running On Port ${PORT}`);

});