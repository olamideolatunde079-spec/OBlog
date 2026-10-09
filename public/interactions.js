// ============================================================
// interactions.js — OBlog User Interactions
// Handles: like, save, share, follow, comments, replies,
//          create/edit/delete post, discussions, contact,
//          profile tabs — all backed by localStorage
// ============================================================

// -------------------------------------------------------
// LIKE A POST
// Each post's likes field is now an array of user IDs.
// One user can only like a post once.
// -------------------------------------------------------
function toggleLike(postId, btn) {

    // A user must be logged in to like
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to like posts.");
        setTimeout(function () { window.location.href = "login.html"; }, 1200);
        return;
    }

    // Load all posts from localStorage
    const allPosts = getStoredPosts();

    // Find the post that was liked
    const postIndex = allPosts.findIndex(function (p) { return p.id == postId; });
    if (postIndex === -1) return;

    const post = allPosts[postIndex];

    // Make sure likes is an array (handle old integer data)
    if (!Array.isArray(post.likes)) {
        post.likes = [];
    }

    // Check if this user has already liked this post
    const alreadyLiked = post.likes.includes(currentUser.id);

    const countEl = btn.querySelector(".like-count");
    const iconEl  = btn.querySelector("i");

    if (alreadyLiked) {
        // --- UNLIKE: remove user ID from likes array ---
        post.likes = post.likes.filter(function (id) { return id !== currentUser.id; });

        // Update the button appearance
        btn.classList.remove("liked");
        if (iconEl) iconEl.className = "fa-regular fa-heart";
        btn.setAttribute("aria-pressed", "false");

        showToast("💔 Like removed");

    } else {
        // --- LIKE: add user ID to likes array ---
        post.likes.push(currentUser.id);

        // Update the button appearance
        btn.classList.add("liked");
        if (iconEl) iconEl.className = "fa-solid fa-heart";
        btn.setAttribute("aria-pressed", "true");

        showToast("❤️ Post liked!");

        // Notify the post author (but not if they liked their own post)
        if (post.authorId !== currentUser.id) {
            addNotification(
                post.authorId,
                "like",
                currentUser.name + " liked your post: \"" + post.title + "\"",
                "fa-heart"
            );
        }
    }

    // Update the count shown on screen
    if (countEl) countEl.textContent = post.likes.length;

    // Save the updated posts back to localStorage
    savePosts(allPosts);

    // Keep the global `posts` variable in sync
    if (typeof posts !== "undefined") {
        posts[postIndex] = post;
    }
}

// Make toggleLike globally available
window.toggleLike = toggleLike;

// -------------------------------------------------------
// SAVE / BOOKMARK A POST
// Stored as an array of { userId, postId } objects so
// each user only sees their own saved posts.
// -------------------------------------------------------
function toggleSave(postId, btn) {

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to save posts.");
        setTimeout(function () { window.location.href = "login.html"; }, 1200);
        return;
    }

    // Get the saved-posts list for ALL users
    const allSaved = JSON.parse(localStorage.getItem("oblogSavedPosts")) || [];

    // Check if this user already saved this post
    const existingIndex = allSaved.findIndex(function (s) {
        return s.userId === currentUser.id && s.postId == postId;
    });

    const textEl = btn.querySelector(".save-text");
    const iconEl = btn.querySelector("i");

    if (existingIndex !== -1) {
        // --- UNSAVE ---
        allSaved.splice(existingIndex, 1);

        btn.classList.remove("saved");
        if (iconEl) iconEl.className = "fa-regular fa-bookmark";
        if (textEl) textEl.textContent = "Save";
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Save this post");

        showToast("🔖 Post unsaved");

    } else {
        // --- SAVE ---
        allSaved.push({ userId: currentUser.id, postId: postId });

        btn.classList.add("saved");
        if (iconEl) iconEl.className = "fa-solid fa-bookmark";
        if (textEl) textEl.textContent = "Saved";
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Unsave this post");

        showToast("🔖 Post saved!");
    }

    // Save back to localStorage
    localStorage.setItem("oblogSavedPosts", JSON.stringify(allSaved));
}

// Make toggleSave globally available
window.toggleSave = toggleSave;

// -------------------------------------------------------
// CHECK IF CURRENT USER SAVED A POST
// Returns true or false
// -------------------------------------------------------
function isPostSavedByUser(postId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const allSaved = JSON.parse(localStorage.getItem("oblogSavedPosts")) || [];
    return allSaved.some(function (s) {
        return s.userId === currentUser.id && s.postId == postId;
    });
}

window.isPostSavedByUser = isPostSavedByUser;

// -------------------------------------------------------
// SHARE A POST
// Copies the post URL to clipboard
// -------------------------------------------------------
function sharePost(postId) {
    const url = window.location.origin +
                window.location.pathname.replace(/[^/]*$/, "") +
                "post.html?id=" + postId;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
            showToast("🔗 Post link copied!");
        }).catch(function () {
            showToast("🔗 Post link copied!");
        });
    } else {
        showToast("🔗 Post link copied!");
    }
}

window.sharePost = sharePost;

// -------------------------------------------------------
// FOLLOW / UNFOLLOW AN AUTHOR
// Updates BOTH users' followers/following arrays
// -------------------------------------------------------
function toggleFollow(authorId, btn) {

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to follow authors.");
        setTimeout(function () { window.location.href = "login.html"; }, 1200);
        return;
    }

    // Cannot follow yourself
    if (currentUser.id === authorId) {
        showToast("You cannot follow yourself.");
        return;
    }

    const users      = getUsers();
    const myIndex    = users.findIndex(function (u) { return u.id === currentUser.id; });
    const themIndex  = users.findIndex(function (u) { return u.id === authorId; });

    if (myIndex === -1) return;

    // Ensure following/followers are arrays
    if (!Array.isArray(users[myIndex].following))   users[myIndex].following  = [];
    if (themIndex !== -1 && !Array.isArray(users[themIndex].followers)) users[themIndex].followers = [];

    const isFollowing = users[myIndex].following.includes(authorId);

    if (isFollowing) {
        // --- UNFOLLOW ---
        users[myIndex].following = users[myIndex].following.filter(function (id) { return id !== authorId; });
        if (themIndex !== -1) {
            users[themIndex].followers = users[themIndex].followers.filter(function (id) { return id !== currentUser.id; });
        }

        btn.textContent = "Follow";
        btn.classList.remove("following");
        btn.setAttribute("aria-pressed", "false");

        showToast("👤 Unfollowed");

    } else {
        // --- FOLLOW ---
        users[myIndex].following.push(authorId);
        if (themIndex !== -1) {
            users[themIndex].followers.push(currentUser.id);

            // Notify the followed user
            addNotification(
                authorId,
                "follow",
                currentUser.name + " started following you.",
                "fa-user-plus"
            );
        }

        btn.textContent = "Following";
        btn.classList.add("following");
        btn.setAttribute("aria-pressed", "true");

        showToast("✅ Now following!");
    }

    // Save the updated users array
    saveUsers(users);
}

window.toggleFollow = toggleFollow;

// -------------------------------------------------------
// CHECK IF CURRENT USER IS FOLLOWING SOMEONE
// -------------------------------------------------------
function isFollowingUser(authorId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const users = getUsers();
    const me    = users.find(function (u) { return u.id === currentUser.id; });
    if (!me || !Array.isArray(me.following)) return false;

    return me.following.includes(authorId);
}

window.isFollowingUser = isFollowingUser;

// -------------------------------------------------------
// POST PAGE — Load and display a single post
// -------------------------------------------------------
function initPostPage() {
    const postContent = document.getElementById("postContent");
    if (!postContent) return;

    // Get the post ID from the URL (e.g. post.html?id=post_sample_1)
    const postId = getUrlParam("id");

    // Read all posts from localStorage (includes sample + user posts)
    const allPosts = getStoredPosts();
    const post     = allPosts.find(function (p) { return p.id == postId; });

    if (!post) {
        postContent.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-file" aria-hidden="true"></i>
                <h3>Post not found</h3>
                <p>This post may have been removed or the link is incorrect.</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:16px;">Back to Home</a>
            </div>`;
        return;
    }

    // Update the browser tab title
    document.title = post.title + " — OBlog";

    // Build tags HTML
    let tagsHTML = "";
    post.tags.forEach(function (tag) {
        tagsHTML += `<span class="tag">#${tag}</span>`;
    });

    // Work out likes
    const likesArr   = Array.isArray(post.likes) ? post.likes : [];
    const currentUser = getCurrentUser();
    const isLiked    = currentUser ? likesArr.includes(currentUser.id) : false;
    const likeCount  = likesArr.length;
    const heartIcon  = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";

    // Work out saved state
    const isSaved      = isPostSavedByUser(post.id);
    const bookmarkIcon = isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark";
    const saveText     = isSaved ? "Saved" : "Save";

    // Work out follow state for the post author
    const followingAuthor = isFollowingUser(post.authorId);
    const followText      = followingAuthor ? "Following" : "Follow";
    const followClass     = followingAuthor ? "following" : "";

    // Is the current user the author? Show edit/delete buttons
    const isAuthor  = currentUser && currentUser.id === post.authorId;
    const ownerBtns = isAuthor ? `
        <button class="btn btn-secondary btn-sm" id="editPostBtn" aria-label="Edit this post">
            <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
        </button>
        <button class="btn btn-secondary btn-sm" id="deletePostBtn"
            style="color:var(--color-danger); border-color:var(--color-danger);"
            aria-label="Delete this post">
            <i class="fa-solid fa-trash" aria-hidden="true"></i> Delete
        </button>` : "";

    // Build the image/video header media
    var mediaHTML = "";
    if (post.video) {
        mediaHTML = `<video class="post-hero-image" controls preload="metadata"
                           style="background:#000;"
                           aria-label="Video: ${post.title}">
                       <source src="${post.video}">
                       Your browser does not support the video tag.
                     </video>`;
    } else if (post.image) {
        mediaHTML = `<img class="post-hero-image" src="${post.image}" alt="${post.title}" loading="lazy">`;
    }

    // Get author display info — look up live from oblogUsers first
    const allUsersForPost = typeof getUsers === "function" ? getUsers() : [];
    const liveAuthor      = allUsersForPost.find(function (u) { return u.id === post.authorId; });
    const authorName   = liveAuthor ? liveAuthor.name     : (post.author   || "Unknown Author");
    const authorHandle = liveAuthor ? liveAuthor.username : (post.username || "unknown");
    const authorAvatar = liveAuthor ? liveAuthor.avatar   : (post.avatar   || "https://api.dicebear.com/7.x/avataaars/svg?seed=unknown");
    const dateDisplay  = post.createdAt ? formatTimeAgo(post.createdAt) : (post.date || "");
    // Build a clickable profile link using the authorId
    const authorProfileLink = post.authorId ? "profile.html?id=" + post.authorId : "profile.html";

    postContent.innerHTML = `
        <article class="post-article">
            ${mediaHTML}
            <div class="post-article-body">

                <div class="post-tags" style="margin-bottom:16px;">${tagsHTML}</div>

                <h1 class="post-article-title">${post.title}</h1>

                <div class="post-article-meta">
                    <div class="post-article-author">
                        <a href="${authorProfileLink}" onclick="event.stopPropagation();"
                           style="flex-shrink:0; display:inline-block;">
                            <img src="${authorAvatar}" alt="${authorName}" loading="lazy"
                                 style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--border-color);">
                        </a>
                        <div>
                            <a href="${authorProfileLink}"
                               style="font-weight:700;color:var(--text-primary);font-size:15px;text-decoration:none;">${authorName}</a>
                            <p style="font-size:13px;margin:0;">@${authorHandle} · ${dateDisplay} · ${post.readTime || ""}</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                        ${ownerBtns}
                        <button
                            class="btn btn-secondary btn-sm follow-post-author ${followClass}"
                            data-author-id="${post.authorId}"
                            aria-label="${followText} ${authorName}"
                            aria-pressed="${followingAuthor}"
                            ${isAuthor ? "style='display:none'" : ""}
                        >${followText}</button>
                    </div>
                </div>

                <div class="post-article-actions">
                    <button class="btn btn-secondary btn-sm like-btn-full ${isLiked ? "liked" : ""}"
                        data-post-id="${post.id}"
                        aria-label="Like this post"
                        aria-pressed="${isLiked}"
                        style="${isLiked ? "color:var(--color-danger);border-color:var(--color-danger);" : ""}">
                        <i class="${heartIcon}" aria-hidden="true"></i>
                        <span class="like-count">${likeCount}</span> Likes
                    </button>

                    <button class="btn btn-secondary btn-sm share-btn-full"
                        data-post-id="${post.id}"
                        aria-label="Share this post">
                        <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share
                    </button>

                    <button class="btn btn-secondary btn-sm save-btn-full ${isSaved ? "saved" : ""}"
                        data-post-id="${post.id}"
                        aria-label="${saveText} this post"
                        aria-pressed="${isSaved}"
                        style="${isSaved ? "color:var(--color-accent);border-color:var(--color-accent);" : ""}">
                        <i class="${bookmarkIcon}" aria-hidden="true"></i>
                        <span class="save-text">${saveText}</span>
                    </button>
                </div>

                <div class="post-article-content">${post.content}</div>

            </div>

            <!-- COMMENTS SECTION -->
            <div class="comments-section" id="commentsSection">
                <h3>Comments <span id="commentCount" style="color:var(--text-muted);font-weight:400;font-size:16px;"></span></h3>

                <div class="comment-form">
                    <textarea
                        id="commentInput"
                        class="form-input form-textarea"
                        placeholder="${currentUser ? "Write a comment..." : "Log in to comment..."}"
                        rows="3"
                        aria-label="Write a comment"
                        ${currentUser ? "" : "disabled"}
                    ></textarea>
                    <div id="commentError" class="form-error" style="display:none;">
                        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                        Your comment cannot be empty.
                    </div>
                    ${currentUser
                        ? `<button id="postCommentBtn" class="btn btn-primary btn-sm" style="align-self:flex-start;">
                               <i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Post Comment
                           </button>`
                        : `<a href="login.html" class="btn btn-primary btn-sm" style="align-self:flex-start;">
                               <i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Log in to comment
                           </a>`
                    }
                </div>

                <div id="commentList" class="comment-list"></div>
            </div>
        </article>
    `;

    // Load existing comments
    loadComments(post.id);

    // Wire up all the action buttons
    attachPostPageHandlers(post.id, post.authorId);
}

// -------------------------------------------------------
// LOAD COMMENTS FOR A POST
// Comments are stored inside the post object itself
// -------------------------------------------------------
function loadComments(postId) {
    const commentList  = document.getElementById("commentList");
    const commentCount = document.getElementById("commentCount");
    if (!commentList) return;

    // Get the post
    const allPosts    = getStoredPosts();
    const post        = allPosts.find(function (p) { return p.id == postId; });
    const postComments = (post && Array.isArray(post.comments)) ? post.comments : [];

    // Update the comment count
    if (commentCount) {
        commentCount.textContent = "(" + postComments.length + ")";
    }

    if (postComments.length === 0) {
        commentList.innerHTML = `
            <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:14px;">
                <i class="fa-regular fa-comment" aria-hidden="true" style="display:block;font-size:28px;margin-bottom:8px;"></i>
                No comments yet. Be the first to comment!
            </div>`;
        return;
    }

    // Build HTML for each comment (newest first)
    let html = "";
    postComments.forEach(function (comment) {
        // Look up the author's current avatar from users list
        const users      = getUsers();
        const commenter  = users.find(function (u) { return u.id === comment.userId; });
        const avatar     = commenter ? commenter.avatar : (comment.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=anon");
        const name       = commenter ? commenter.name   : (comment.author || "User");
        const username   = commenter ? commenter.username : "";
        const timeDisplay = formatTimeAgo(comment.createdAt);

        // Build reply HTML if there are replies
        let repliesHTML = "";
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(function (reply) {
                const replyUser   = users.find(function (u) { return u.id === reply.userId; });
                const replyAvatar = replyUser ? replyUser.avatar : "https://api.dicebear.com/7.x/avataaars/svg?seed=anon";
                const replyName   = replyUser ? replyUser.name : (reply.author || "User");
                const replyTime   = formatTimeAgo(reply.createdAt);

                repliesHTML += `
                    <div class="comment-item" style="margin-left:50px;margin-top:8px;background:var(--bg-page);">
                        <img class="comment-avatar" src="${replyAvatar}" alt="${replyName}" loading="lazy">
                        <div class="comment-body">
                            <span class="comment-author">${replyName} <span class="comment-time">${replyTime}</span></span>
                            <p class="comment-text">${escapeHTML(reply.text)}</p>
                        </div>
                    </div>`;
            });
        }

        // Check if current user can delete this comment
        const currentUser  = getCurrentUser();
        const canDelete    = currentUser && comment.userId === currentUser.id;
        const deleteBtn    = canDelete
            ? `<button class="action-btn delete-comment-btn"
                   data-comment-id="${comment.id}"
                   data-post-id="${postId}"
                   style="font-size:12px;color:var(--color-danger);margin-left:auto;"
                   aria-label="Delete comment">
                   <i class="fa-solid fa-trash" aria-hidden="true"></i>
               </button>` : "";

        // Reply button (only for logged-in users)
        const replyBtn = currentUser
            ? `<button class="action-btn reply-btn" data-comment-id="${comment.id}" style="font-size:12px;">
                   <i class="fa-solid fa-reply" aria-hidden="true"></i> Reply
               </button>` : "";

        html += `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img class="comment-avatar" src="${avatar}" alt="${name}" loading="lazy">
                <div class="comment-body" style="flex:1;">
                    <div style="display:flex;align-items:center;gap:4px;">
                        <span class="comment-author">${name}</span>
                        ${username ? `<span style="font-size:12px;color:var(--text-muted);">@${username}</span>` : ""}
                        <span class="comment-time">${timeDisplay}</span>
                        ${deleteBtn}
                    </div>
                    <p class="comment-text">${escapeHTML(comment.text)}</p>
                    <div style="display:flex;gap:8px;margin-top:4px;">
                        ${replyBtn}
                    </div>
                    <!-- Reply form (hidden, shown when reply is clicked) -->
                    <div class="reply-form" id="replyForm_${comment.id}" style="display:none;margin-top:8px;">
                        <textarea
                            class="form-input"
                            id="replyInput_${comment.id}"
                            placeholder="Write a reply..."
                            rows="2"
                            style="font-size:13px;"
                            aria-label="Write a reply"
                        ></textarea>
                        <div style="display:flex;gap:8px;margin-top:6px;">
                            <button class="btn btn-primary btn-sm submit-reply-btn"
                                data-comment-id="${comment.id}"
                                data-post-id="${postId}"
                                style="font-size:12px;">
                                Post Reply
                            </button>
                            <button class="btn btn-secondary btn-sm cancel-reply-btn"
                                data-comment-id="${comment.id}"
                                style="font-size:12px;">
                                Cancel
                            </button>
                        </div>
                    </div>
                    ${repliesHTML}
                </div>
            </div>`;
    });

    commentList.innerHTML = html;

    // Attach reply toggle buttons
    commentList.querySelectorAll(".reply-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const commentId = btn.getAttribute("data-comment-id");
            const form      = document.getElementById("replyForm_" + commentId);
            if (form) {
                const isVisible = form.style.display !== "none";
                form.style.display = isVisible ? "none" : "block";
                if (!isVisible) {
                    const input = document.getElementById("replyInput_" + commentId);
                    if (input) input.focus();
                }
            }
        });
    });

    // Attach cancel reply buttons
    commentList.querySelectorAll(".cancel-reply-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const commentId = btn.getAttribute("data-comment-id");
            const form      = document.getElementById("replyForm_" + commentId);
            if (form) form.style.display = "none";
        });
    });

    // Attach submit reply buttons
    commentList.querySelectorAll(".submit-reply-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const commentId = btn.getAttribute("data-comment-id");
            const postId    = btn.getAttribute("data-post-id");
            const input     = document.getElementById("replyInput_" + commentId);
            if (!input || input.value.trim() === "") return;
            submitReply(postId, commentId, input.value.trim());
        });
    });

    // Attach delete comment buttons
    commentList.querySelectorAll(".delete-comment-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (!confirm("Delete this comment?")) return;
            const commentId = btn.getAttribute("data-comment-id");
            const postId    = btn.getAttribute("data-post-id");
            deleteComment(postId, commentId);
        });
    });
}

// -------------------------------------------------------
// ADD A COMMENT
// -------------------------------------------------------
function attachPostPageHandlers(postId, authorId) {

    // ---- POST COMMENT button ----
    const postCommentBtn = document.getElementById("postCommentBtn");
    const commentInput   = document.getElementById("commentInput");
    const commentError   = document.getElementById("commentError");

    if (postCommentBtn && commentInput) {
        postCommentBtn.addEventListener("click", function () {
            const commentText = commentInput.value.trim();

            if (commentText === "") {
                if (commentError) commentError.style.display = "flex";
                commentInput.focus();
                return;
            }
            if (commentError) commentError.style.display = "none";

            submitComment(postId, commentText, authorId);
            commentInput.value = "";
        });

        commentInput.addEventListener("input", function () {
            if (commentError) commentError.style.display = "none";
        });
    }

    // ---- LIKE button ----
    const likeBtn = document.querySelector(".like-btn-full");
    if (likeBtn) {
        likeBtn.addEventListener("click", function () {
            toggleLike(postId, likeBtn);
            if (likeBtn.classList.contains("liked")) {
                likeBtn.style.color       = "var(--color-danger)";
                likeBtn.style.borderColor = "var(--color-danger)";
            } else {
                likeBtn.style.color       = "";
                likeBtn.style.borderColor = "";
            }
        });
    }

    // ---- SHARE button ----
    const shareBtn = document.querySelector(".share-btn-full");
    if (shareBtn) {
        shareBtn.addEventListener("click", function () { sharePost(postId); });
    }

    // ---- SAVE button ----
    const saveBtn = document.querySelector(".save-btn-full");
    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            toggleSave(postId, saveBtn);
            if (saveBtn.classList.contains("saved")) {
                saveBtn.style.color       = "var(--color-accent)";
                saveBtn.style.borderColor = "var(--color-accent)";
            } else {
                saveBtn.style.color       = "";
                saveBtn.style.borderColor = "";
            }
        });
    }

    // ---- FOLLOW author button ----
    const followBtn = document.querySelector(".follow-post-author");
    if (followBtn) {
        followBtn.addEventListener("click", function () {
            toggleFollow(authorId, followBtn);
        });
    }

    // ---- EDIT POST button ----
    const editBtn = document.getElementById("editPostBtn");
    if (editBtn) {
        editBtn.addEventListener("click", function () {
            window.location.href = "create-post.html?edit=" + postId;
        });
    }

    // ---- DELETE POST button ----
    const deleteBtn = document.getElementById("deletePostBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
            if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
            deletePost(postId);
        });
    }
}

// -------------------------------------------------------
// SUBMIT A COMMENT
// Saves the comment into the post's comments array
// -------------------------------------------------------
function submitComment(postId, text, postAuthorId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const allPosts  = getStoredPosts();
    const postIndex = allPosts.findIndex(function (p) { return p.id == postId; });
    if (postIndex === -1) return;

    if (!Array.isArray(allPosts[postIndex].comments)) {
        allPosts[postIndex].comments = [];
    }

    // Create the comment object
    const newComment = {
        id:        "comment_" + Date.now(),
        userId:    currentUser.id,
        author:    currentUser.name,
        avatar:    currentUser.avatar,
        text:      text,
        replies:   [],
        createdAt: new Date().toISOString()
    };

    // Add to the FRONT of the comments array (newest first)
    allPosts[postIndex].comments.unshift(newComment);

    // Save back to localStorage
    savePosts(allPosts);

    // Refresh the comments display
    loadComments(postId);

    showToast("💬 Comment posted!");

    // Notify the post author
    if (postAuthorId && postAuthorId !== currentUser.id) {
        addNotification(
            postAuthorId,
            "comment",
            currentUser.name + " commented on your post.",
            "fa-comment"
        );
    }
}

// -------------------------------------------------------
// SUBMIT A REPLY to a comment
// -------------------------------------------------------
function submitReply(postId, commentId, text) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const allPosts  = getStoredPosts();
    const postIndex = allPosts.findIndex(function (p) { return p.id == postId; });
    if (postIndex === -1) return;

    const comments    = allPosts[postIndex].comments || [];
    const commentIndex = comments.findIndex(function (c) { return c.id === commentId; });
    if (commentIndex === -1) return;

    if (!Array.isArray(comments[commentIndex].replies)) {
        comments[commentIndex].replies = [];
    }

    comments[commentIndex].replies.push({
        id:        "reply_" + Date.now(),
        userId:    currentUser.id,
        author:    currentUser.name,
        avatar:    currentUser.avatar,
        text:      text,
        createdAt: new Date().toISOString()
    });

    allPosts[postIndex].comments = comments;
    savePosts(allPosts);
    loadComments(postId);
    showToast("↩️ Reply posted!");
}

// -------------------------------------------------------
// DELETE A COMMENT
// -------------------------------------------------------
function deleteComment(postId, commentId) {
    const allPosts  = getStoredPosts();
    const postIndex = allPosts.findIndex(function (p) { return p.id == postId; });
    if (postIndex === -1) return;

    allPosts[postIndex].comments = (allPosts[postIndex].comments || []).filter(function (c) {
        return c.id !== commentId;
    });

    savePosts(allPosts);
    loadComments(postId);
    showToast("🗑️ Comment deleted.");
}

// -------------------------------------------------------
// DELETE A POST
// Only the post's author can do this
// -------------------------------------------------------
function deletePost(postId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const allPosts = getStoredPosts();
    const post     = allPosts.find(function (p) { return p.id == postId; });

    if (!post || post.authorId !== currentUser.id) {
        showToast("You can only delete your own posts.");
        return;
    }

    const updated = allPosts.filter(function (p) { return p.id != postId; });
    savePosts(updated);

    showToast("🗑️ Post deleted.");
    setTimeout(function () { window.location.href = "index.html"; }, 1200);
}

// -------------------------------------------------------
// CREATE / EDIT POST
// Handles the create-post.html form
// -------------------------------------------------------
function initCreatePost() {
    const publishBtn = document.getElementById("publishBtn");
    const draftBtn   = document.getElementById("draftBtn");

    if (!publishBtn) return;

    // Check if we're in EDIT mode (URL has ?edit=postId)
    const editId = getUrlParam("edit");
    if (editId) {
        loadPostIntoEditForm(editId);
    }

    publishBtn.addEventListener("click", function () { submitPost("published"); });
    if (draftBtn) {
        draftBtn.addEventListener("click", function () { submitPost("draft"); });
    }

    // Character counter for the title
    const titleInput   = document.getElementById("postTitle");
    const titleCounter = document.getElementById("titleCounter");
    if (titleInput && titleCounter) {
        titleInput.addEventListener("input", function () {
            const length = titleInput.value.length;
            titleCounter.textContent  = length + "/120";
            titleCounter.style.color  = length > 100 ? "var(--color-danger)" : "var(--text-muted)";
        });
    }
}

// Pre-fill the form when editing an existing post
function loadPostIntoEditForm(postId) {
    const allPosts = getStoredPosts();
    const post     = allPosts.find(function (p) { return p.id == postId; });
    if (!post) return;

    const currentUser = getCurrentUser();
    if (!currentUser || post.authorId !== currentUser.id) {
        showToast("You can only edit your own posts.");
        return;
    }

    // Update the page heading
    const heading = document.getElementById("createHeading");
    if (heading) heading.innerHTML = '<i class="fa-solid fa-pen" style="color:var(--color-accent)"></i> Edit Post';

    const publishBtn = document.getElementById("publishBtn");
    if (publishBtn) publishBtn.innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Changes';

    // Fill in the fields
    const fields = {
        postTitle:       post.title       || "",
        postDescription: post.description || "",
        postContent:     post.content ? post.content.replace(/<[^>]+>/g, "") : "",
        postTags:        Array.isArray(post.tags) ? post.tags.join(", ") : "",
        postImage:       post.image && post.image.startsWith("http") ? post.image : ""
    };

    Object.keys(fields).forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    });

    // Restore cover image preview if the post already has one
    if (post.image) {
        window.pendingCoverImage = post.image;
        var previewBox = document.getElementById("imagePreviewBox");
        var previewImg = document.getElementById("imagePreview");
        if (previewImg) previewImg.src = post.image;
        if (previewBox) previewBox.style.display = "block";
    }

    // Restore video preview if the post already has one
    if (post.video) {
        window.pendingVideoData = post.video;
        var videoPreviewBox = document.getElementById("videoPreviewBox");
        var videoPreview    = document.getElementById("videoPreview");
        if (videoPreview)    videoPreview.src = post.video;
        if (videoPreviewBox) videoPreviewBox.style.display = "block";
        // Show the video section
        var videoGroup = document.getElementById("videoUploadGroup");
        if (videoGroup) videoGroup.style.display = "block";
    }

    // Mark the correct post type radio
    const typeRadio = document.querySelector('input[name="postType"][value="' + (post.type || "article") + '"]');
    if (typeRadio) typeRadio.checked = true;

    // Store the edit ID on the form so submitPost knows this is an edit
    const form = document.getElementById("publishBtn");
    if (form) form.setAttribute("data-edit-id", postId);
}

// Submit (create or update) a post
function submitPost(status) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to create posts.");
        setTimeout(function () { window.location.href = "login.html"; }, 1200);
        return;
    }

    // Get form values
    const titleInput   = document.getElementById("postTitle");
    const descInput    = document.getElementById("postDescription");
    const contentInput = document.getElementById("postContent");
    const tagsInput    = document.getElementById("postTags");
    const imageInput   = document.getElementById("postImage");
    const typeInput    = document.querySelector('input[name="postType"]:checked');
    const postType     = typeInput ? typeInput.value : "article";

    // Validation
    let isValid = true;
    document.querySelectorAll(".form-error").forEach(function (el) { el.style.display = "none"; });

    if (!titleInput || titleInput.value.trim() === "") {
        showFieldError("titleError", "Please enter a post title.");
        isValid = false;
    }
    if (!descInput || descInput.value.trim() === "") {
        showFieldError("descError", "Please enter a short description.");
        isValid = false;
    }
    if (!contentInput || contentInput.value.trim() === "") {
        showFieldError("contentError", "Please enter some content for your post.");
        isValid = false;
    }

    if (!isValid) {
        showToast("⚠️ Please fill in all required fields.");
        return;
    }

    const title   = titleInput.value.trim();
    const desc    = descInput.value.trim();
    const content = contentInput.value.trim();
    const rawTags = tagsInput ? tagsInput.value.trim() : "";
    const tagsArr = rawTags
        ? rawTags.split(",").map(function (t) { return t.trim(); }).filter(Boolean)
        : ["General"];

    // --- Resolve cover image ---
    // Priority: 1) file uploaded via FileReader (window.pendingCoverImage)
    //           2) URL typed in the URL field
    //           3) empty (no cover image)
    var resolvedImage = "";
    if (window.pendingCoverImage && window.pendingCoverImage !== "") {
        resolvedImage = window.pendingCoverImage;
    } else if (imageInput && imageInput.value.trim() !== "") {
        resolvedImage = imageInput.value.trim();
    }

    // --- Resolve video ---
    var resolvedVideo = "";
    if (window.pendingVideoData && window.pendingVideoData !== "") {
        resolvedVideo = window.pendingVideoData;
    }

    // Check if we're editing an existing post
    const editId = getUrlParam("edit");

    if (editId) {
        // ---- UPDATE EXISTING POST ----
        const allPosts  = getStoredPosts();
        const postIndex = allPosts.findIndex(function (p) { return p.id == editId; });

        if (postIndex !== -1 && allPosts[postIndex].authorId === currentUser.id) {
            allPosts[postIndex].title       = title;
            allPosts[postIndex].description = desc;
            allPosts[postIndex].content     = "<p>" + content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
            allPosts[postIndex].tags        = tagsArr;
            allPosts[postIndex].image       = resolvedImage || allPosts[postIndex].image;
            allPosts[postIndex].video       = resolvedVideo || allPosts[postIndex].video || "";
            allPosts[postIndex].type        = postType;
            allPosts[postIndex].readTime    = Math.ceil(content.split(" ").length / 200) + " min read";
            allPosts[postIndex].updatedAt   = new Date().toISOString();

            savePosts(allPosts);
            showToast("✅ Post updated!");
            setTimeout(function () { window.location.href = "post.html?id=" + editId; }, 1200);
        }

    } else {
        // ---- CREATE NEW POST ----
        const newPost = {
            id:          "post_" + Date.now(),
            authorId:    currentUser.id,
            author:      currentUser.name,
            username:    currentUser.username,
            avatar:      currentUser.avatar,
            title:       title,
            description: desc,
            content:     "<p>" + content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>",
            tags:        tagsArr,
            image:       resolvedImage,
            video:       resolvedVideo,
            type:        postType,
            likes:       [],
            comments:    [],
            shares:      0,
            readTime:    Math.ceil(content.split(" ").length / 200) + " min read",
            date:        "Just now",
            status:      status,
            featured:    false,
            createdAt:   new Date().toISOString()
        };

        const allPosts = getStoredPosts();
        allPosts.unshift(newPost);
        savePosts(allPosts);

        if (status === "published") {
            showToast("🎉 Post published!");
            setTimeout(function () { window.location.href = "index.html"; }, 1200);
        } else {
            showToast("💾 Draft saved!");
        }
    }
}

// -------------------------------------------------------
// DISCUSSIONS PAGE
// -------------------------------------------------------
function initDiscussionsPage() {
    const discussionFeed = document.getElementById("discussionFeed");
    if (!discussionFeed) return;

    const userDiscussions = JSON.parse(localStorage.getItem("oblogDiscussions")) || [];
    const allDiscussions  = userDiscussions.concat(discussions);
    renderDiscussions(allDiscussions);

    const newDiscBtn = document.getElementById("postDiscussionBtn");
    if (newDiscBtn) {
        newDiscBtn.addEventListener("click", function () { submitDiscussion(); });
    }
}

function renderDiscussions(discussionList) {
    const container = document.getElementById("discussionFeed");
    if (!container) return;

    if (discussionList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-comments" aria-hidden="true"></i>
                <h3>No discussions yet</h3>
                <p>Start the first discussion!</p>
            </div>`;
        return;
    }

    let html = "";
    discussionList.forEach(function (disc) {
        let tagsHTML = "";
        (disc.tags || []).forEach(function (tag) {
            tagsHTML += `<span class="tag">#${tag}</span>`;
        });

        const likesArr = Array.isArray(disc.likes) ? disc.likes : [];
        const currentUser = getCurrentUser();
        const isLiked  = currentUser ? likesArr.includes(currentUser.id) : false;
        const heartIcon = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";

        html += `
            <div class="discussion-card">
                <div class="post-author-row" style="margin-bottom:12px;">
                    <img class="post-author-avatar" src="${disc.avatar || ""}" alt="${disc.author}" loading="lazy">
                    <div class="post-author-info">
                        <span class="post-author-name">${disc.author}</span>
                        <span class="post-author-meta">@${disc.username} · ${disc.date || ""}</span>
                    </div>
                </div>
                <h3 class="discussion-title">${disc.title}</h3>
                <p class="discussion-body">${disc.body}</p>
                <div class="post-tags" style="margin-bottom:12px;">${tagsHTML}</div>
                <div class="post-footer">
                    <div class="post-actions">
                        <button class="action-btn disc-like-btn ${isLiked ? "liked" : ""}"
                            data-disc-id="${disc.id}"
                            aria-label="Like this discussion"
                            aria-pressed="${isLiked}">
                            <i class="${heartIcon}" aria-hidden="true"></i>
                            <span class="disc-like-count">${likesArr.length}</span>
                        </button>
                        <span class="action-btn" style="cursor:default;">
                            <i class="fa-regular fa-comment" aria-hidden="true"></i>
                            ${disc.comments || 0}
                        </span>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;

    container.querySelectorAll(".disc-like-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const discId = btn.getAttribute("data-disc-id");
            toggleDiscussionLike(discId, btn);
        });
    });
}

function toggleDiscussionLike(discId, btn) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to like discussions.");
        return;
    }

    // Check in user discussions first, then sample discussions
    let allDiscussions = JSON.parse(localStorage.getItem("oblogDiscussions")) || [];
    let found = allDiscussions.find(function (d) { return d.id == discId; });

    if (!found) {
        // It's a sample discussion — we track likes separately
        let sampleLikes = JSON.parse(localStorage.getItem("oblogSampleDiscLikes")) || {};
        if (!sampleLikes[discId]) sampleLikes[discId] = [];

        const countEl = btn.querySelector(".disc-like-count");
        const iconEl  = btn.querySelector("i");
        let count     = parseInt(countEl.textContent) || 0;

        if (sampleLikes[discId].includes(currentUser.id)) {
            sampleLikes[discId] = sampleLikes[discId].filter(function (id) { return id !== currentUser.id; });
            count--;
            btn.classList.remove("liked");
            if (iconEl) iconEl.className = "fa-regular fa-heart";
            btn.setAttribute("aria-pressed", "false");
        } else {
            sampleLikes[discId].push(currentUser.id);
            count++;
            btn.classList.add("liked");
            if (iconEl) iconEl.className = "fa-solid fa-heart";
            btn.setAttribute("aria-pressed", "true");
            showToast("❤️ Discussion liked!");
        }
        countEl.textContent = count;
        localStorage.setItem("oblogSampleDiscLikes", JSON.stringify(sampleLikes));
        return;
    }

    // User-created discussion
    if (!Array.isArray(found.likes)) found.likes = [];
    const countEl = btn.querySelector(".disc-like-count");
    const iconEl  = btn.querySelector("i");

    if (found.likes.includes(currentUser.id)) {
        found.likes = found.likes.filter(function (id) { return id !== currentUser.id; });
        btn.classList.remove("liked");
        if (iconEl) iconEl.className = "fa-regular fa-heart";
        btn.setAttribute("aria-pressed", "false");
    } else {
        found.likes.push(currentUser.id);
        btn.classList.add("liked");
        if (iconEl) iconEl.className = "fa-solid fa-heart";
        btn.setAttribute("aria-pressed", "true");
        showToast("❤️ Discussion liked!");
    }

    if (countEl) countEl.textContent = found.likes.length;
    localStorage.setItem("oblogDiscussions", JSON.stringify(allDiscussions));
}

function submitDiscussion() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("🔒 Please log in to start a discussion.");
        return;
    }

    const titleInput = document.getElementById("discussionTitle");
    const bodyInput  = document.getElementById("discussionBody");
    const tagsInput  = document.getElementById("discussionTags");

    let isValid = true;
    document.querySelectorAll(".disc-error").forEach(function (el) { el.style.display = "none"; });

    if (!titleInput || titleInput.value.trim() === "") {
        const errEl = document.getElementById("discTitleError");
        if (errEl) { errEl.textContent = "Please enter a discussion title."; errEl.style.display = "flex"; }
        isValid = false;
    }
    if (!bodyInput || bodyInput.value.trim() === "") {
        const errEl = document.getElementById("discBodyError");
        if (errEl) { errEl.textContent = "Please enter your discussion question."; errEl.style.display = "flex"; }
        isValid = false;
    }

    if (!isValid) { showToast("⚠️ Please fill in all required fields."); return; }

    const rawTags  = tagsInput ? tagsInput.value.trim() : "";
    const tagsArr  = rawTags
        ? rawTags.split(",").map(function (t) { return t.trim(); }).filter(Boolean)
        : ["General"];

    const newDisc = {
        id:        "disc_" + Date.now(),
        authorId:  currentUser.id,
        author:    currentUser.name,
        username:  currentUser.username,
        avatar:    currentUser.avatar,
        title:     titleInput.value.trim(),
        body:      bodyInput.value.trim(),
        likes:     [],
        comments:  0,
        date:      "Just now",
        createdAt: new Date().toISOString(),
        tags:      tagsArr
    };

    const saved = JSON.parse(localStorage.getItem("oblogDiscussions")) || [];
    saved.unshift(newDisc);
    localStorage.setItem("oblogDiscussions", JSON.stringify(saved));

    titleInput.value = "";
    bodyInput.value  = "";
    if (tagsInput) tagsInput.value = "";

    const allDiscussions = saved.concat(discussions);
    renderDiscussions(allDiscussions);
    showToast("💬 Discussion posted!");
}

// -------------------------------------------------------
// CONTACT FORM
// -------------------------------------------------------
function initContactForm() {
    const submitBtn = document.getElementById("contactSubmitBtn");
    if (!submitBtn) return;
    submitBtn.addEventListener("click", function () { submitContactForm(); });
}

function submitContactForm() {
    const nameInput    = document.getElementById("contactName");
    const emailInput   = document.getElementById("contactEmail");
    const subjectInput = document.getElementById("contactSubject");
    const messageInput = document.getElementById("contactMessage");

    document.querySelectorAll(".contact-error").forEach(function (el) { el.style.display = "none"; });

    let isValid = true;
    if (!nameInput    || nameInput.value.trim() === "")                              { showContactError("nameError",    "Please enter your name.");               isValid = false; }
    if (!emailInput   || emailInput.value.trim() === "" || !emailInput.value.includes("@")) { showContactError("emailError",   "Please enter a valid email address."); isValid = false; }
    if (!subjectInput || subjectInput.value.trim() === "")                           { showContactError("subjectError", "Please enter a subject.");               isValid = false; }
    if (!messageInput || messageInput.value.trim() === "")                           { showContactError("messageError", "Please enter your message.");            isValid = false; }
    if (!isValid) return;

    const form    = document.getElementById("contactForm");
    const success = document.getElementById("contactSuccess");
    if (form)    form.style.display    = "none";
    if (success) success.style.display = "block";
}

function showContactError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) { el.textContent = message; el.style.display = "flex"; }
}

// -------------------------------------------------------
// PROFILE TABS
// -------------------------------------------------------
function initProfileTabs() {
    const tabs     = document.querySelectorAll(".profile-tab");
    const contents = document.querySelectorAll(".profile-tab-content");

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (t)    { t.classList.remove("active"); });
            contents.forEach(function (c) { c.classList.remove("active"); });
            tab.classList.add("active");
            const target = document.getElementById(tab.getAttribute("data-tab"));
            if (target) target.classList.add("active");
        });
    });
}

// -------------------------------------------------------
// SHARED UTILITIES
// -------------------------------------------------------
function showFieldError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) { el.textContent = message; el.style.display = "flex"; }
}

function escapeHTML(text) {
    const div       = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// -------------------------------------------------------
// INIT ON PAGE LOAD
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // Use getCurrentPageName() from app.js which handles cleanUrls (.html stripping)
    var page = typeof getCurrentPageName === "function"
        ? getCurrentPageName()
        : (window.location.pathname.split("/").pop() || "index.html");

    if (page === "post.html")         initPostPage();
    if (page === "create-post.html")  initCreatePost();
    if (page === "discussions.html")  initDiscussionsPage();
    if (page === "contact.html")      initContactForm();
    if (page === "profile.html")      initProfileTabs();
});
