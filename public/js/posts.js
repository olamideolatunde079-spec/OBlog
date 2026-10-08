// ============================================================
// posts.js — OBlog Post Rendering & Search
// Reads from oblogPosts (localStorage) via getStoredPosts().
// Author info is looked up live from oblogUsers so that
// profile edits reflect everywhere automatically.
// ============================================================

// -------------------------------------------------------
// LIVE AUTHOR LOOKUP
// Given a post's authorId, returns the freshest user object
// from oblogUsers. Falls back to the snapshot values stored
// on the post if the user isn't found.
// -------------------------------------------------------
function getPostAuthor(post) {
    if (typeof getUsers === "function") {
        const allUsers = getUsers();
        const found    = allUsers.find(function (u) { return u.id === post.authorId; });
        if (found) return found;
    }
    // Fall back to snapshot values frozen into the post at creation time
    return {
        id:       post.authorId || "",
        name:     post.author   || "Unknown",
        username: post.username || "user",
        avatar:   post.avatar   || "https://api.dicebear.com/7.x/avataaars/svg?seed=unknown"
    };
}

// -------------------------------------------------------
// BUILD ONE POST CARD
// Returns an HTML string for a single post card.
// Author name and avatar are clickable links to the
// author's profile page (profile.html?id=authorId).
// -------------------------------------------------------
function buildPostCard(post) {

    // Tags HTML
    let tagsHTML = "";
    (post.tags || []).forEach(function (tag) {
        tagsHTML += `<span class="tag">#${tag}</span>`;
    });

    // Cover image HTML (only if the post has one)
    let imageHTML = "";
    if (post.image) {
        imageHTML = `<img class="post-card-image" src="${post.image}" alt="${post.title}" loading="lazy">`;
    }

    // --- LIVE AUTHOR INFO ---
    const author      = getPostAuthor(post);
    const authorId    = author.id   || post.authorId || "";
    const authorName  = author.name || "Unknown";
    const authorUser  = author.username || "user";
    const authorAvatar = author.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=unknown";
    const profileHref = authorId ? "profile.html?id=" + authorId : "profile.html";

    // --- LIKES ---
    const likesArr    = Array.isArray(post.likes) ? post.likes : [];
    const currentUser = getCurrentUser();
    const isLiked     = currentUser ? likesArr.includes(currentUser.id) : false;
    const likedClass  = isLiked ? "liked" : "";
    const likeCount   = likesArr.length;
    const heartIcon   = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";

    // --- SAVED ---
    const isSaved      = isPostSavedByUser ? isPostSavedByUser(post.id) : false;
    const savedClass   = isSaved ? "saved" : "";
    const bookmarkIcon = isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark";
    const saveText     = isSaved ? "Saved" : "Save";

    // --- COMMENT COUNT ---
    const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);

    // --- OWNER CONTROLS (edit / delete — only shown to post author) ---
    const isAuthor  = currentUser && post.authorId === currentUser.id;
    const ownerHTML = isAuthor ? `
        <a href="create-post.html?edit=${post.id}" class="action-btn" aria-label="Edit this post"
           style="color:var(--color-accent);" onclick="event.stopPropagation();">
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </a>
        <button class="action-btn delete-post-btn" data-post-id="${post.id}"
            aria-label="Delete this post"
            style="color:var(--color-danger);">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>` : "";

    // --- DATE DISPLAY ---
    const dateDisplay = post.createdAt ? formatTimeAgo(post.createdAt) : (post.date || "");

    return `
        <article class="post-card" data-post-id="${post.id}">
            ${imageHTML}
            <div class="post-card-body">

                <div class="post-author-row">
                    <!-- Avatar is a link to the author's profile -->
                    <a href="${profileHref}" class="post-author-avatar-link"
                       onclick="event.stopPropagation();"
                       aria-label="View ${authorName}'s profile"
                       style="flex-shrink:0;">
                        <img
                            class="post-author-avatar"
                            src="${authorAvatar}"
                            alt="${authorName}"
                            loading="lazy"
                        >
                    </a>
                    <div class="post-author-info">
                        <!-- Name is also a link to the author's profile -->
                        <a href="${profileHref}"
                           class="post-author-name"
                           onclick="event.stopPropagation();"
                           style="color:var(--text-primary); text-decoration:none;">
                           ${authorName}
                        </a>
                        <span class="post-author-meta">@${authorUser} · ${dateDisplay}</span>
                    </div>
                    ${ownerHTML}
                </div>

                <h2 class="post-title">${post.title}</h2>
                <p class="post-description">${post.description || ""}</p>
                <div class="post-tags">${tagsHTML}</div>

                <div class="post-footer">
                    <div class="post-actions">

                        <button
                            class="action-btn like-btn ${likedClass}"
                            data-post-id="${post.id}"
                            aria-label="Like this post"
                            aria-pressed="${isLiked}"
                        >
                            <i class="${heartIcon}" aria-hidden="true"></i>
                            <span class="like-count">${likeCount}</span>
                        </button>

                        <a
                            href="post.html?id=${post.id}"
                            class="action-btn"
                            aria-label="View ${commentCount} comments"
                        >
                            <i class="fa-regular fa-comment" aria-hidden="true"></i>
                            <span>${commentCount}</span>
                        </a>

                        <button
                            class="action-btn share-btn"
                            data-post-id="${post.id}"
                            aria-label="Share this post"
                        >
                            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                            <span>Share</span>
                        </button>

                        <button
                            class="action-btn save-btn ${savedClass}"
                            data-post-id="${post.id}"
                            aria-label="${saveText} this post"
                            aria-pressed="${isSaved}"
                        >
                            <i class="${bookmarkIcon}" aria-hidden="true"></i>
                            <span class="save-text">${saveText}</span>
                        </button>

                    </div>
                    <span class="read-time">
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        ${post.readTime || ""}
                    </span>
                </div>

            </div>
        </article>
    `;
}

// -------------------------------------------------------
// RENDER A FEED into a container element
// -------------------------------------------------------
function renderFeed(postsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (postsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-newspaper" aria-hidden="true"></i>
                <h3>No posts found</h3>
                <p>Try searching for another topic or tag.</p>
            </div>`;
        return;
    }

    let feedHTML = "";
    postsToShow.forEach(function (post) {
        feedHTML += buildPostCard(post);
    });
    container.innerHTML = feedHTML;

    // Card click → go to post page (ignore clicks on buttons/links)
    container.querySelectorAll(".post-card").forEach(function (card) {
        card.addEventListener("click", function (event) {
            if (event.target.closest("button") || event.target.closest("a")) return;
            const postId = card.getAttribute("data-post-id");
            window.location.href = "post.html?id=" + postId;
        });
    });

    // Attach delete handlers on owner control buttons
    container.querySelectorAll(".delete-post-btn").forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            if (!confirm("Are you sure you want to delete this post?")) return;
            const postId = btn.getAttribute("data-post-id");
            if (typeof deletePost === "function") deletePost(postId);
            // Re-render after deletion
            setTimeout(function () {
                const allPosts = getAllPostsForFeed();
                renderFeed(allPosts, containerId);
                attachInteractionHandlers();
            }, 200);
        });
    });
}

// -------------------------------------------------------
// GET ALL POSTS for the feed
// Reads from localStorage (oblogPosts) which contains
// both sample posts and user-created posts, merged.
// -------------------------------------------------------
function getAllPostsForFeed() {
    // getStoredPosts() is defined in auth.js and reads oblogPosts
    return getStoredPosts().filter(function (p) {
        return p.status === "published" || !p.status;
    });
}

// -------------------------------------------------------
// HOMEPAGE FEED
// -------------------------------------------------------
function initHomeFeed() {
    const feedContainer = document.getElementById("postFeed");
    if (!feedContainer) return;

    // Get all published posts
    let allPosts = getAllPostsForFeed();

    // Sort by newest first (by createdAt)
    allPosts.sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    let currentPosts = allPosts.slice();

    // Check for a ?search= in the URL
    const urlSearch = getUrlParam("search");
    if (urlSearch) {
        const searchInput = document.getElementById("heroSearchInput");
        if (searchInput) searchInput.value = urlSearch;
        currentPosts = searchPosts(allPosts, urlSearch);
    }

    renderFeed(currentPosts, "postFeed");

    // ---- FEED TABS ----
    const tabs = document.querySelectorAll(".feed-tab");
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");

            const tabName = tab.getAttribute("data-tab");
            // Re-read posts fresh each time
            const freshPosts = getAllPostsForFeed();

            if (tabName === "popular") {
                // Sort by number of likes (most popular first)
                const sorted = freshPosts.slice().sort(function (a, b) {
                    const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
                    const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
                    return bLikes - aLikes;
                });
                renderFeed(sorted, "postFeed");
            } else {
                renderFeed(freshPosts, "postFeed");
            }

            attachInteractionHandlers();
        });
    });

    // ---- TOPIC CHIPS ----
    const topicChips = document.querySelectorAll(".topic-chip");
    topicChips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            const isActive = chip.classList.contains("active");
            topicChips.forEach(function (c) { c.classList.remove("active"); });

            const freshPosts = getAllPostsForFeed();

            if (isActive) {
                renderFeed(freshPosts, "postFeed");
            } else {
                chip.classList.add("active");
                const topic   = chip.getAttribute("data-topic");
                const filtered = filterByTag(freshPosts, topic);
                renderFeed(filtered, "postFeed");
            }

            attachInteractionHandlers();
        });
    });

    attachInteractionHandlers();
}

// -------------------------------------------------------
// SEARCH
// -------------------------------------------------------
function searchPosts(postList, searchText) {
    const query = searchText.toLowerCase().trim();
    if (query === "") return postList;

    return postList.filter(function (post) {
        const titleMatch  = (post.title       || "").toLowerCase().includes(query);
        const descMatch   = (post.description || "").toLowerCase().includes(query);
        const authorMatch = (post.author      || "").toLowerCase().includes(query);
        const userMatch   = (post.username    || "").toLowerCase().includes(query);
        const tagMatch    = (post.tags        || []).some(function (tag) {
            return tag.toLowerCase().includes(query);
        });
        return titleMatch || descMatch || authorMatch || userMatch || tagMatch;
    });
}

// -------------------------------------------------------
// FILTER BY TAG
// -------------------------------------------------------
function filterByTag(postList, tag) {
    return postList.filter(function (post) {
        return (post.tags || []).some(function (t) {
            return t.toLowerCase() === tag.toLowerCase();
        });
    });
}

// -------------------------------------------------------
// HERO SEARCH BAR
// -------------------------------------------------------
function initHeroSearch() {
    const searchInput = document.getElementById("heroSearchInput");
    const searchBtn   = document.getElementById("heroSearchBtn");
    if (!searchInput) return;

    function runSearch() {
        const query      = searchInput.value.trim();
        const allPosts   = getAllPostsForFeed();
        const result     = searchPosts(allPosts, query);
        renderFeed(result, "postFeed");
        attachInteractionHandlers();

        const counter = document.getElementById("searchResultCount");
        if (counter) {
            counter.textContent = query === ""
                ? ""
                : result.length + " result" + (result.length === 1 ? "" : "s") + " for \"" + query + "\"";
        }
    }

    searchInput.addEventListener("input",   runSearch);
    if (searchBtn) searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("keydown", function (e) { if (e.key === "Enter") runSearch(); });
}

// -------------------------------------------------------
// SIDEBAR
// -------------------------------------------------------
function initSidebar() {

    // Trending Topics
    const trendingContainer = document.getElementById("sidebarTrendingTopics");
    if (trendingContainer && typeof topics !== "undefined") {
        let html = "";
        topics.slice(0, 8).forEach(function (topic) {
            html += `<a href="explore.html" class="tag">#${topic.name}</a>`;
        });
        trendingContainer.innerHTML = html;
    }

    // Who to Follow — pull from registered users (oblogUsers)
    const followContainer = document.getElementById("sidebarWhoToFollow");
    if (followContainer) {
        const currentUser = getCurrentUser();
        const allUsers    = getUsers();

        // Show up to 4 users that are NOT the current user
        const suggestions = allUsers
            .filter(function (u) { return !currentUser || u.id !== currentUser.id; })
            .slice(0, 4);

        if (suggestions.length === 0) {
            followContainer.innerHTML = `<p style="font-size:13px;color:var(--text-muted);">No authors to show yet.</p>`;
            return;
        }

        let html = "";
        suggestions.forEach(function (user) {
            const following  = isFollowingUser(user.id);
            const btnText    = following ? "Following" : "Follow";
            const btnClass   = following ? "following" : "";
            const followerCount = Array.isArray(user.followers) ? user.followers.length : 0;

            html += `
                <div class="author-item">
                    <img class="author-item-avatar" src="${user.avatar}" alt="${user.name}" loading="lazy">
                    <div class="author-item-info">
                        <span class="author-item-name">${user.name}</span>
                        <span class="author-item-meta">${followerCount} follower${followerCount !== 1 ? "s" : ""}</span>
                    </div>
                    <button
                        class="btn-follow-sm ${btnClass}"
                        data-author-id="${user.id}"
                        aria-label="${btnText} ${user.name}"
                        aria-pressed="${following}"
                    >${btnText}</button>
                </div>`;
        });

        followContainer.innerHTML = html;
        attachSidebarFollowHandlers();
    }
}

function attachSidebarFollowHandlers() {
    document.querySelectorAll("#sidebarWhoToFollow .btn-follow-sm").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const authorId = btn.getAttribute("data-author-id");
            if (typeof toggleFollow === "function") toggleFollow(authorId, btn);
        });
    });
}

// -------------------------------------------------------
// EXPLORE PAGE
// -------------------------------------------------------
function initExplorePage() {

    // Trending posts — top 4 by likes
    const trendingFeed = document.getElementById("trendingFeed");
    if (trendingFeed) {
        const allPosts = getAllPostsForFeed();
        const sorted   = allPosts.slice().sort(function (a, b) {
            const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
            const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
            return bLikes - aLikes;
        });

        let html = "";
        sorted.slice(0, 4).forEach(function (post) { html += buildPostCard(post); });
        trendingFeed.innerHTML = html;

        trendingFeed.querySelectorAll(".post-card").forEach(function (card) {
            card.addEventListener("click", function (event) {
                if (event.target.closest("button") || event.target.closest("a")) return;
                window.location.href = "post.html?id=" + card.getAttribute("data-post-id");
            });
        });

        attachInteractionHandlers();
    }

    // Topics grid
    const topicsGrid = document.getElementById("topicsGrid");
    if (topicsGrid && typeof topics !== "undefined") {
        let html = "";
        topics.forEach(function (topic) {
            html += `
                <div class="topic-card" role="button" tabindex="0" aria-label="Browse ${topic.name} posts"
                     onclick="window.location.href='index.html?search=${encodeURIComponent(topic.name)}'">
                    <div class="topic-card-icon">
                        <i class="fa-brands ${topic.icon} fa-solid" aria-hidden="true"></i>
                    </div>
                    <div>
                        <span class="topic-card-name">#${topic.name}</span>
                        <span class="topic-card-count">${topic.count} posts</span>
                    </div>
                </div>`;
        });
        topicsGrid.innerHTML = html;
    }

    // Authors grid — from oblogUsers
    const authorsGrid = document.getElementById("authorsGrid");
    if (authorsGrid) {
        const currentUser = getCurrentUser();
        const allUsers    = getUsers();

        let html = "";
        allUsers.forEach(function (user) {
            if (currentUser && user.id === currentUser.id) return; // skip self

            const following      = isFollowingUser(user.id);
            const btnText        = following ? "Following" : "Follow";
            const btnClass       = following ? "following" : "";
            const followerCount  = Array.isArray(user.followers) ? user.followers.length : 0;
            const userPosts      = getStoredPosts().filter(function (p) { return p.authorId === user.id; });

            let skillsHTML = "";
            (user.skills || []).forEach(function (skill) {
                skillsHTML += `<span class="tag">${skill}</span>`;
            });

            html += `
                <div class="author-card">
                    <img class="author-card-avatar" src="${user.avatar}" alt="${user.name}" loading="lazy">
                    <span class="author-card-name">${user.name}</span>
                    <span class="author-card-username">@${user.username}</span>
                    <p class="author-card-bio">${user.bio || "OBlog member."}</p>
                    <div class="author-card-stats">
                        <div class="author-stat">
                            <span class="author-stat-number">${followerCount}</span>
                            <span class="author-stat-label">Followers</span>
                        </div>
                        <div class="author-stat">
                            <span class="author-stat-number">${userPosts.length}</span>
                            <span class="author-stat-label">Posts</span>
                        </div>
                    </div>
                    <button
                        class="btn btn-primary btn-sm btn-full follow-author-btn ${btnClass}"
                        data-author-id="${user.id}"
                        aria-label="${btnText} ${user.name}"
                        aria-pressed="${following}"
                    >${btnText}</button>
                </div>`;
        });

        authorsGrid.innerHTML = html || `<p style="color:var(--text-muted);font-size:14px;">No authors yet. Register to be the first!</p>`;

        authorsGrid.querySelectorAll(".follow-author-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const authorId = btn.getAttribute("data-author-id");
                if (typeof toggleFollow === "function") toggleFollow(authorId, btn);
            });
        });
    }
}

// -------------------------------------------------------
// ATTACH INTERACTION HANDLERS
// Called after every re-render to wire up like/save/share
// Uses node replacement to prevent duplicate listeners
// -------------------------------------------------------
function attachInteractionHandlers() {

    // Like buttons
    document.querySelectorAll(".like-btn").forEach(function (btn) {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll(".like-btn").forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            const postId = btn.getAttribute("data-post-id");
            if (typeof toggleLike === "function") toggleLike(postId, btn);
        });
    });

    // Save buttons
    document.querySelectorAll(".save-btn").forEach(function (btn) {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll(".save-btn").forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            const postId = btn.getAttribute("data-post-id");
            if (typeof toggleSave === "function") toggleSave(postId, btn);
        });
    });

    // Share buttons
    document.querySelectorAll(".share-btn").forEach(function (btn) {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll(".share-btn").forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            const postId = btn.getAttribute("data-post-id");
            if (typeof sharePost === "function") sharePost(postId);
        });
    });
}

// -------------------------------------------------------
// MINI POST CARD (used in explore/sidebar)
// -------------------------------------------------------
function buildMiniPostCard(post) {
    const likesArr = Array.isArray(post.likes) ? post.likes : [];
    const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);
    return `
        <article class="post-card" data-post-id="${post.id}" style="cursor:pointer;"
                 onclick="window.location.href='post.html?id=${post.id}'">
            <div class="post-card-body">
                <div class="post-author-row">
                    <img class="post-author-avatar" src="${post.avatar || ""}" alt="${post.author || ""}" loading="lazy">
                    <div class="post-author-info">
                        <span class="post-author-name">${post.author || ""}</span>
                        <span class="post-author-meta">@${post.username || ""}</span>
                    </div>
                </div>
                <h3 class="post-title" style="font-size:16px;">${post.title}</h3>
                <div class="post-footer" style="padding-top:10px;border-top:1px solid var(--border-color);margin-top:10px;">
                    <div class="post-actions">
                        <span class="action-btn" style="cursor:default;">
                            <i class="fa-regular fa-heart" aria-hidden="true"></i> ${likesArr.length}
                        </span>
                        <span class="action-btn" style="cursor:default;">
                            <i class="fa-regular fa-comment" aria-hidden="true"></i> ${commentCount}
                        </span>
                    </div>
                    <span class="read-time">${post.readTime || ""}</span>
                </div>
            </div>
        </article>`;
}

// -------------------------------------------------------
// INIT ON PAGE LOAD
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const page = window.location.pathname.split("/").pop() || "index.html";

    if (page === "index.html" || page === "") {
        initHomeFeed();
        initHeroSearch();
        initSidebar();
    }

    if (page === "explore.html") {
        initExplorePage();
    }

    // Populate trending topics sidebar on post.html
    if (page === "post.html") {
        const trendingContainer = document.getElementById("sidebarTrendingTopics");
        if (trendingContainer && typeof topics !== "undefined") {
            let topicsHTML = "";
            topics.slice(0, 8).forEach(function (topic) {
                topicsHTML += `<a href="explore.html" class="tag">#${topic.name}</a>`;
            });
            trendingContainer.innerHTML = topicsHTML;
        }
    }
});
