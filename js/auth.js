// ============================================================
// auth.js — OBlog Account & Session System
// Handles: register, login, logout, session, profile editing,
//          per-user notifications, and auth-aware nav updates
//
// IMPORTANT: Load this script BEFORE app.js, interactions.js
//            and posts.js so the current user is available.
// ============================================================

// -------------------------------------------------------
// STORAGE HELPERS (standalone — auth.js loads first)
// We define our own simple helpers here so auth.js does
// not depend on app.js loading first.
// -------------------------------------------------------

// Get all registered users from localStorage
// Returns an empty array if no users have registered yet
function getUsers() {
    return JSON.parse(localStorage.getItem("oblogUsers")) || [];
}

// Save the updated users array back to localStorage
function saveUsers(users) {
    localStorage.setItem("oblogUsers", JSON.stringify(users));
}

// Get the ID of the user who is currently logged in
// Returns null if nobody is logged in
function getCurrentUserId() {
    return localStorage.getItem("oblogCurrentUser");
}

// Find the full user object for the logged-in user
// Returns null if nobody is logged in or user not found
function getCurrentUser() {
    const id    = getCurrentUserId();
    if (!id) return null;
    const users = getUsers();
    return users.find(function (u) { return u.id === id; }) || null;
}

// Make getCurrentUser available to other scripts
window.getCurrentUser = getCurrentUser;

// Update a user's data and save it
// Pass in a partial object — only the fields you want to change
function updateUser(userId, changes) {
    const users = getUsers();
    const index = users.findIndex(function (u) { return u.id === userId; });
    if (index === -1) return;

    // Merge the changes into the existing user object
    Object.keys(changes).forEach(function (key) {
        users[index][key] = changes[key];
    });

    saveUsers(users);
}

// Make updateUser available globally
window.updateUser = updateUser;

// Get posts from localStorage
function getStoredPosts() {
    return JSON.parse(localStorage.getItem("oblogPosts")) || [];
}

// Save posts back to localStorage
function savePosts(posts) {
    localStorage.setItem("oblogPosts", JSON.stringify(posts));
}

// Make these available globally so other scripts can use them
window.getStoredPosts = getStoredPosts;
window.savePosts      = savePosts;
window.getUsers       = getUsers;
window.saveUsers      = saveUsers;

// Get notifications for the current user
function getUserNotifications(userId) {
    const all = JSON.parse(localStorage.getItem("oblogNotifications")) || [];
    // Return notifications addressed to this user, newest first
    return all.filter(function (n) { return n.userId === userId; }).reverse();
}

// Save a new notification for a user
function addNotification(userId, type, message, icon) {
    const all = JSON.parse(localStorage.getItem("oblogNotifications")) || [];
    all.push({
        id:        "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        userId:    userId,
        type:      type,
        message:   message,
        icon:      icon || "fa-bell",
        read:      false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem("oblogNotifications", JSON.stringify(all));
}

// Mark all notifications as read for a user
function markAllNotificationsRead(userId) {
    const all = JSON.parse(localStorage.getItem("oblogNotifications")) || [];
    all.forEach(function (n) {
        if (n.userId === userId) n.read = true;
    });
    localStorage.setItem("oblogNotifications", JSON.stringify(all));
}

// Make notification helpers global
window.addNotification             = addNotification;
window.getUserNotifications        = getUserNotifications;
window.markAllNotificationsRead    = markAllNotificationsRead;

// -------------------------------------------------------
// SESSION GUARD
// Redirect to login if a page requires authentication
// Call requireLogin() at the top of any protected page
// -------------------------------------------------------
function requireLogin() {
    if (!getCurrentUserId()) {
        window.location.href = "login.html";
    }
}

// Redirect to homepage if already logged in (for login/register pages)
function requireGuest() {
    if (getCurrentUserId()) {
        window.location.href = "index.html";
    }
}

window.requireLogin = requireLogin;
window.requireGuest = requireGuest;

// -------------------------------------------------------
// REGISTRATION
// Called when the register form is submitted
// -------------------------------------------------------
function registerUser(name, username, email, password, confirmPassword) {

    // --- Validation ---
    const errors = {};

    if (!name || name.trim() === "") {
        errors.name = "Please enter your full name.";
    }

    if (!username || username.trim() === "") {
        errors.username = "Please choose a username.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.username = "Username can only contain letters, numbers, and underscores.";
    }

    if (!email || email.trim() === "" || !email.includes("@")) {
        errors.email = "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    // Check for duplicate username or email
    const users = getUsers();

    const usernameTaken = users.some(function (u) {
        return u.username.toLowerCase() === username.trim().toLowerCase();
    });

    if (usernameTaken) {
        errors.username = "Username already exists. Please choose another.";
    }

    const emailTaken = users.some(function (u) {
        return u.email.toLowerCase() === email.trim().toLowerCase();
    });

    if (emailTaken) {
        errors.email = "An account with this email already exists.";
    }

    // If there are any errors, return them
    if (Object.keys(errors).length > 0) {
        return { success: false, errors: errors };
    }

    // --- Create the new user ---
    const newUser = {
        id:        "user_" + Date.now(),
        name:      name.trim(),
        username:  username.trim().toLowerCase(),
        email:     email.trim().toLowerCase(),
        password:  password, // NOTE: stored in plain text — educational project only
        bio:       "",
        avatar:    "https://api.dicebear.com/7.x/avataaars/svg?seed=" + username.trim().toLowerCase(),
        location:  "",
        website:   "",
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
    };

    // Add to the users array and save
    users.push(newUser);
    saveUsers(users);

    // Log this user in automatically
    localStorage.setItem("oblogCurrentUser", newUser.id);

    return { success: true, user: newUser };
}

// -------------------------------------------------------
// LOGIN
// Allow login with username OR email + password
// -------------------------------------------------------
function loginUser(usernameOrEmail, password) {

    // Validate inputs
    if (!usernameOrEmail || usernameOrEmail.trim() === "") {
        return { success: false, error: "Please enter your username or email." };
    }

    if (!password || password === "") {
        return { success: false, error: "Please enter your password." };
    }

    // Search for the user by username or email
    const users  = getUsers();
    const search = usernameOrEmail.trim().toLowerCase();

    const user = users.find(function (u) {
        return u.username.toLowerCase() === search ||
               u.email.toLowerCase()    === search;
    });

    // No matching user found
    if (!user) {
        return { success: false, error: "Incorrect username/email or password." };
    }

    // Check password
    if (user.password !== password) {
        return { success: false, error: "Incorrect username/email or password." };
    }

    // Save the current user's ID to localStorage
    // This is what keeps the user logged in after refresh
    localStorage.setItem("oblogCurrentUser", user.id);

    return { success: true, user: user };
}

// -------------------------------------------------------
// LOGOUT
// Clear the current session and go to login page
// -------------------------------------------------------
function logoutUser() {
    localStorage.removeItem("oblogCurrentUser");
    window.location.href = "login.html";
}

window.logoutUser = logoutUser;

// -------------------------------------------------------
// UPDATE NAVIGATION based on login state
// Called on every page load to show/hide the right links
// -------------------------------------------------------
function updateNavForAuthState() {
    const user = getCurrentUser();

    // Find the nav-right container on this page
    const navRight = document.querySelector(".nav-right");
    if (!navRight) return;

    if (user) {
        // ---- LOGGED IN ----

        // Update the profile avatar link to show the real user's avatar
        const navAvatar = navRight.querySelector(".nav-avatar img");
        if (navAvatar) {
            navAvatar.src = user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.username;
            navAvatar.alt = user.name;
        }

        // Desktop: inject a logout icon button into nav-right (hidden on mobile via CSS)
        if (!document.getElementById("logoutBtn")) {
            const logoutBtn = document.createElement("button");
            logoutBtn.id        = "logoutBtn";
            logoutBtn.className = "nav-icon-btn";
            logoutBtn.setAttribute("aria-label", "Log out");
            logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>';
            logoutBtn.title     = "Log out";
            logoutBtn.addEventListener("click", function () {
                if (confirm("Are you sure you want to log out?")) {
                    logoutUser();
                }
            });
            // Insert before the hamburger button
            const hamburger = navRight.querySelector(".hamburger");
            if (hamburger) {
                navRight.insertBefore(logoutBtn, hamburger);
            } else {
                navRight.appendChild(logoutBtn);
            }
        }

        // Mobile drawer: inject a logout entry at the bottom if not already there
        const mobileMenu = document.getElementById("mobileMenu");
        if (mobileMenu && !mobileMenu.querySelector(".mobile-menu-logout")) {
            // Divider
            const divider = document.createElement("div");
            divider.className = "mobile-menu-divider";
            mobileMenu.appendChild(divider);

            // Logout button
            const mobileLogout = document.createElement("button");
            mobileLogout.className = "mobile-menu-logout";
            mobileLogout.innerHTML =
                '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Log Out';
            mobileLogout.addEventListener("click", function () {
                if (confirm("Are you sure you want to log out?")) {
                    // Close the drawer first
                    if (typeof closeMobileMenu === "function") closeMobileMenu();
                    logoutUser();
                }
            });
            mobileMenu.appendChild(mobileLogout);
        }

        // Hide login/register links from desktop nav-links if they exist
        document.querySelectorAll(".nav-link-login, .nav-link-register").forEach(function (el) {
            el.style.display = "none";
        });

        // Update notification badge count
        updateNotifBadge(user.id);

    } else {
        // ---- LOGGED OUT ----

        // Change the profile avatar to a link to login
        const navAvatarLink = navRight.querySelector(".nav-avatar");
        if (navAvatarLink) {
            navAvatarLink.href = "login.html";
            const img = navAvatarLink.querySelector("img");
            if (img) {
                img.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=guest";
                img.alt = "Log in";
            }
        }

        // Show login/register links if they exist in the nav
        document.querySelectorAll(".nav-link-login, .nav-link-register").forEach(function (el) {
            el.style.display = "";
        });

        // Hide the notifications and create buttons for logged-out users
        // (we still show them but redirect to login on click)
    }
}

// Update the notification badge dot with the unread count
function updateNotifBadge(userId) {
    const badge = document.querySelector(".notif-badge");
    if (!badge) return;

    const notifs   = getUserNotifications(userId);
    const unread   = notifs.filter(function (n) { return !n.read; });

    if (unread.length > 0) {
        badge.style.display = "";
        badge.setAttribute("aria-label", unread.length + " unread notifications");
    } else {
        badge.style.display = "none";
    }
}

// -------------------------------------------------------
// RENDER NOTIFICATIONS (replaces the static version in app.js)
// Shows real per-user notifications from localStorage
// -------------------------------------------------------
function renderUserNotifications() {
    const list = document.getElementById("notifList");
    if (!list) return;

    const user = getCurrentUser();
    if (!user) {
        list.innerHTML = `
            <div style="padding:20px; text-align:center; font-size:14px; color:var(--text-muted);">
                <a href="login.html" style="color:var(--color-accent); font-weight:600;">Log in</a> to see your notifications.
            </div>`;
        return;
    }

    const notifs = getUserNotifications(user.id);

    if (notifs.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding:24px;">
                <i class="fa-regular fa-bell" aria-hidden="true"></i>
                <p>No notifications yet.</p>
            </div>`;
        return;
    }

    // Show the most recent 10
    let html = "";
    notifs.slice(0, 10).forEach(function (notif) {
        const unreadClass = notif.read ? "" : "unread";
        const timeAgo     = formatTimeAgo(notif.createdAt);

        html += `
            <div class="notif-item ${unreadClass}">
                <div class="notif-icon">
                    <i class="fa-solid ${notif.icon}" aria-hidden="true"></i>
                </div>
                <div class="notif-text">
                    <p>${notif.message}</p>
                    <small>${timeAgo}</small>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;

    // Mark all as read when the user opens the dropdown
    markAllNotificationsRead(user.id);
    updateNotifBadge(user.id);
}

// Make it global so app.js can call it
window.renderUserNotifications = renderUserNotifications;

// -------------------------------------------------------
// FORMAT TIME AGO
// Converts an ISO date string into "2 hours ago" style text
// -------------------------------------------------------
function formatTimeAgo(isoString) {
    if (!isoString) return "Just now";

    const now  = new Date();
    const then = new Date(isoString);
    const diff = Math.floor((now - then) / 1000); // difference in seconds

    if (diff < 60)               return "Just now";
    if (diff < 3600)             return Math.floor(diff / 60)    + " min ago";
    if (diff < 86400)            return Math.floor(diff / 3600)  + " hours ago";
    if (diff < 86400 * 7)        return Math.floor(diff / 86400) + " days ago";

    // Fallback: show the actual date
    return then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Make it globally available
window.formatTimeAgo = formatTimeAgo;

// -------------------------------------------------------
// INIT: Run on every page load (DOMContentLoaded)
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

    // Update the nav to show the correct logged-in/out state
    updateNavForAuthState();

    // ---- REGISTRATION FORM ----
    const regForm = document.getElementById("registerForm");
    if (regForm) {
        regForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Get form values
            const name            = document.getElementById("regName").value;
            const username        = document.getElementById("regUsername").value;
            const email           = document.getElementById("regEmail").value;
            const password        = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;

            // Clear previous errors
            document.querySelectorAll(".auth-error").forEach(function (el) {
                el.style.display = "none";
                el.textContent   = "";
            });

            // Attempt registration
            const result = registerUser(name, username, email, password, confirmPassword);

            if (!result.success) {
                // Show errors next to the relevant fields
                if (result.errors.name)            showAuthError("regNameError",            result.errors.name);
                if (result.errors.username)        showAuthError("regUsernameError",        result.errors.username);
                if (result.errors.email)           showAuthError("regEmailError",           result.errors.email);
                if (result.errors.password)        showAuthError("regPasswordError",        result.errors.password);
                if (result.errors.confirmPassword) showAuthError("regConfirmPasswordError", result.errors.confirmPassword);
                return;
            }

            // Success — redirect to homepage
            window.location.href = "index.html";
        });
    }

    // ---- LOGIN FORM ----
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const usernameOrEmail = document.getElementById("loginUsername").value;
            const password        = document.getElementById("loginPassword").value;

            // Clear previous errors
            const errorEl = document.getElementById("loginError");
            if (errorEl) {
                errorEl.style.display = "none";
                errorEl.textContent   = "";
            }

            // Attempt login
            const result = loginUser(usernameOrEmail, password);

            if (!result.success) {
                if (errorEl) {
                    errorEl.textContent   = result.error;
                    errorEl.style.display = "flex";
                }
                return;
            }

            // Success — go to homepage
            window.location.href = "index.html";
        });
    }

    // ---- EDIT PROFILE FORM ----
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            saveProfileChanges();
        });
    }

    // ---- OPEN/CLOSE EDIT PROFILE MODAL ----
    const editProfileBtn  = document.getElementById("editProfileBtn");
    const editProfileModal = document.getElementById("editProfileModal");
    const closeModalBtn   = document.getElementById("closeModalBtn");

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener("click", function () {
            openEditProfileModal();
        });
    }

    if (closeModalBtn && editProfileModal) {
        closeModalBtn.addEventListener("click", function () {
            editProfileModal.style.display = "none";
        });
    }

    // Close modal on background click
    if (editProfileModal) {
        editProfileModal.addEventListener("click", function (event) {
            if (event.target === editProfileModal) {
                editProfileModal.style.display = "none";
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && editProfileModal) {
            editProfileModal.style.display = "none";
        }
    });

    // ---- AVATAR PREVIEW — URL input ----
    const avatarInput   = document.getElementById("editAvatar");
    const avatarPreview = document.getElementById("editAvatarPreview");

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener("input", function () {
            const url = avatarInput.value.trim();
            if (url) {
                avatarPreview.src          = url;
                avatarPreview.style.display = "block";
                avatarPreview.onerror      = function () { avatarPreview.style.display = "none"; };
            } else {
                avatarPreview.style.display = "none";
            }
        });
    }

    // ---- AVATAR PREVIEW — File upload (FileReader) ----
    const avatarFileInput = document.getElementById("editAvatarFile");

    if (avatarFileInput && avatarPreview) {
        avatarFileInput.addEventListener("change", function () {
            const file = avatarFileInput.files[0];

            // Only accept image files
            if (!file || !file.type.startsWith("image/")) {
                showToast("⚠️ Please select a valid image file.");
                return;
            }

            // Warn about large files (data URLs > ~2MB can cause localStorage issues)
            if (file.size > 2 * 1024 * 1024) {
                showToast("⚠️ Image is large — consider using a URL instead.");
            }

            // Use FileReader to convert the file to a base64 data URL
            const reader = new FileReader();

            reader.onload = function (event) {
                // event.target.result is the full data URL (e.g. "data:image/jpeg;base64,...")
                const imageDataUrl = event.target.result;

                // Show the preview immediately
                avatarPreview.src          = imageDataUrl;
                avatarPreview.style.display = "block";

                // Store the data URL in a temporary data attribute so
                // saveProfileChanges() can pick it up
                avatarFileInput.setAttribute("data-pending-avatar", imageDataUrl);

                // Clear the URL input so the file takes priority
                if (avatarInput) avatarInput.value = "";
            };

            reader.onerror = function () {
                showToast("❌ Could not read the image file.");
            };

            // Start reading the file as a data URL
            reader.readAsDataURL(file);
        });
    }

    // ---- LOGOUT BUTTON (if it exists as a dedicated link on a page) ----
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                logoutUser();
            }
        });
    }

    // ---- Wire up the notification dropdown to use real user data ----
    // Override the renderNotifications function defined in app.js
    // by replacing the notifBtn click handler
    const notifBtn = document.getElementById("notifBtn");
    if (notifBtn) {
        // We'll intercept the click to render real notifications
        // app.js attaches its handler first; ours runs after but
        // overwrites the innerHTML so the result is our data
        notifBtn.addEventListener("click", function () {
            // Small delay so app.js opens the dropdown first
            setTimeout(renderUserNotifications, 0);
        });
    }

    // ---- NOTIF CLEAR button — mark real notifications read ----
    const notifClear = document.getElementById("notifClear");
    if (notifClear) {
        // Override the handler from app.js
        notifClear.addEventListener("click", function () {
            const user = getCurrentUser();
            if (user) {
                markAllNotificationsRead(user.id);
                updateNotifBadge(user.id);
            }
        });
    }

    // ---- GUARD PROTECTED PAGES ----
    // Pages that require a logged-in user
    const protectedPages = ["create-post.html", "profile.html"];
    // Use getCurrentPageName from app.js if available (handles Vercel cleanUrls)
    var page = typeof getCurrentPageName === "function"
        ? getCurrentPageName()
        : (window.location.pathname.split("/").pop() || "index.html");

    if (protectedPages.includes(page) && !getCurrentUserId()) {
        // Save the intended destination so we can redirect after login
        sessionStorage.setItem("oblogRedirectAfterLogin", page);
        window.location.href = "login.html";
    }
});

// -------------------------------------------------------
// OPEN EDIT PROFILE MODAL
// Fill in the current user's data into the form
// -------------------------------------------------------
function openEditProfileModal() {
    const user  = getCurrentUser();
    const modal = document.getElementById("editProfileModal");
    if (!user || !modal) return;

    const nameField     = document.getElementById("editName");
    const usernameField = document.getElementById("editUsername");
    const bioField      = document.getElementById("editBio");
    const avatarField   = document.getElementById("editAvatar");
    const avatarFile    = document.getElementById("editAvatarFile");
    const locationField = document.getElementById("editLocation");
    const avatarPreview = document.getElementById("editAvatarPreview");

    if (nameField)     nameField.value     = user.name     || "";
    if (usernameField) usernameField.value = user.username || "";
    if (bioField)      bioField.value      = user.bio      || "";
    if (locationField) locationField.value = user.location || "";

    // Show the current avatar URL only if it's an external URL (not a data URL)
    if (avatarField) {
        avatarField.value = (user.avatar && user.avatar.startsWith("http")) ? user.avatar : "";
    }

    // Clear any pending file upload from a previous modal open
    if (avatarFile) {
        avatarFile.value = "";
        avatarFile.removeAttribute("data-pending-avatar");
    }

    // Show current avatar preview
    if (avatarPreview && user.avatar) {
        avatarPreview.src           = user.avatar;
        avatarPreview.style.display = "block";
    } else if (avatarPreview) {
        avatarPreview.style.display = "none";
    }

    modal.style.display = "flex";
    if (nameField) nameField.focus();
}

// -------------------------------------------------------
// SAVE PROFILE CHANGES
// Handles both file-upload (FileReader data URL) and
// URL-paste avatars, then persists to localStorage.
// -------------------------------------------------------
function saveProfileChanges() {
    const user = getCurrentUser();
    if (!user) return;

    const newName     = document.getElementById("editName")     ? document.getElementById("editName").value.trim()              : user.name;
    const newUsername = document.getElementById("editUsername") ? document.getElementById("editUsername").value.trim().toLowerCase() : user.username;
    const newBio      = document.getElementById("editBio")      ? document.getElementById("editBio").value.trim()               : user.bio;
    const newLocation = document.getElementById("editLocation") ? document.getElementById("editLocation").value.trim()          : user.location;

    // --- Determine the new avatar ---
    // Priority: 1) FileReader data URL from file upload
    //           2) URL pasted into the URL field
    //           3) Keep the existing avatar
    const avatarFileEl   = document.getElementById("editAvatarFile");
    const avatarUrlEl    = document.getElementById("editAvatar");
    const pendingDataUrl = avatarFileEl ? avatarFileEl.getAttribute("data-pending-avatar") : null;
    const pastedUrl      = avatarUrlEl  ? avatarUrlEl.value.trim()                         : "";

    let newAvatar;
    if (pendingDataUrl) {
        // A file was uploaded and read — use the base64 data URL
        newAvatar = pendingDataUrl;
    } else if (pastedUrl) {
        // A URL was typed in — use it
        newAvatar = pastedUrl;
    } else {
        // Nothing changed — keep existing avatar (or generate DiceBear if none)
        newAvatar = user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + newUsername;
    }

    // --- Validation ---
    if (!newName) {
        showAuthError("editNameError", "Name cannot be empty.");
        return;
    }

    if (!newUsername) {
        showAuthError("editUsernameError", "Username cannot be empty.");
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        showAuthError("editUsernameError", "Username can only contain letters, numbers, and underscores.");
        return;
    }

    // Check if the new username is taken by someone else
    const users         = getUsers();
    const usernameTaken = users.some(function (u) {
        return u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id;
    });

    if (usernameTaken) {
        showAuthError("editUsernameError", "Username already taken.");
        return;
    }

    // --- Persist the updated fields ---
    updateUser(user.id, {
        name:     newName,
        username: newUsername,
        bio:      newBio,
        avatar:   newAvatar,
        location: newLocation
    });

    // Clear the pending file data-attribute
    if (avatarFileEl) avatarFileEl.removeAttribute("data-pending-avatar");

    // Close the modal
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.style.display = "none";

    // Refresh the nav avatar immediately
    updateNavForAuthState();

    // Refresh the profile page if we're on it
    if (typeof loadProfilePage === "function") {
        loadProfilePage();
    }

    if (typeof window.showToast === "function") {
        window.showToast("✅ Profile updated!");
    }
}

// -------------------------------------------------------
// SHOW AUTH ERROR MESSAGE
// -------------------------------------------------------
function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent   = message;
    el.style.display = "flex";
}
