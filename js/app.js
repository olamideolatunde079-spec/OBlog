// ============================================================
// app.js — OBlog Core Application
// Handles: navigation, dark mode, notifications, scroll-to-top,
// toast messages, and shared page setup
// ============================================================

// -------------------------------------------------------
// DARK MODE
// Saves the user's choice in localStorage so it persists
// -------------------------------------------------------

// Find the theme toggle button
const themeToggleBtn = document.getElementById("themeToggle");

// Check if the user previously chose dark mode
const savedTheme = localStorage.getItem("oblog-theme");

// If they chose dark mode before, apply it right away
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    updateThemeIcon(true);
}

// When the user clicks the theme toggle button
if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {

        // Check if dark mode is currently on
        const isDark = document.body.classList.contains("dark-mode");

        if (isDark) {
            // Switch to light mode
            document.body.classList.remove("dark-mode");
            localStorage.setItem("oblog-theme", "light");
            updateThemeIcon(false);
            showToast("☀️ Light mode on");
        } else {
            // Switch to dark mode
            document.body.classList.add("dark-mode");
            localStorage.setItem("oblog-theme", "dark");
            updateThemeIcon(true);
            showToast("🌙 Dark mode on");
        }
    });
}

// Update the icon inside the theme toggle button
function updateThemeIcon(isDark) {
    if (!themeToggleBtn) return;

    if (isDark) {
        // Show sun icon when dark mode is active (click to go light)
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
        themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
    } else {
        // Show moon icon when light mode is active (click to go dark)
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
    }
}

// -------------------------------------------------------
// MOBILE NAVIGATION — side drawer
// -------------------------------------------------------

// Find the hamburger button and the mobile menu
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu   = document.getElementById("mobileMenu");

// Create and inject a backdrop element for the side drawer
var mobileBackdrop = document.getElementById("mobileMenuBackdrop");
if (!mobileBackdrop) {
    mobileBackdrop = document.createElement("div");
    mobileBackdrop.id        = "mobileMenuBackdrop";
    mobileBackdrop.className = "mobile-menu-backdrop";
    mobileBackdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(mobileBackdrop);
}

// Inject the drawer header (logo + close button) if not already there
if (mobileMenu && !mobileMenu.querySelector(".mobile-menu-header")) {
    var drawerHeader = document.createElement("div");
    drawerHeader.className = "mobile-menu-header";
    drawerHeader.innerHTML =
        '<a href="index.html" class="mobile-menu-logo" aria-label="OBlog home">OBlog</a>' +
        '<button class="mobile-menu-close" id="mobileMenuCloseBtn" aria-label="Close navigation menu">' +
        '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
        '</button>';
    mobileMenu.insertBefore(drawerHeader, mobileMenu.firstChild);
}

if (hamburgerBtn && mobileMenu) {

    // When hamburger is clicked, toggle the drawer open/closed
    hamburgerBtn.addEventListener("click", function () {
        const isOpen = mobileMenu.classList.contains("open");
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

// Close when backdrop is clicked
if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", function () {
        closeMobileMenu();
    });
}

// Close when the X button inside the drawer is clicked
document.addEventListener("click", function (event) {
    if (event.target.closest("#mobileMenuCloseBtn")) {
        closeMobileMenu();
    }
});

// Auto-close drawer when any nav link inside it is clicked
if (mobileMenu) {
    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
        el.addEventListener("click", function () {
            // Only close for nav links — not the close button itself (already handled)
            if (!el.closest(".mobile-menu-header")) {
                closeMobileMenu();
            }
        });
    });
}

function openMobileMenu() {
    if (!mobileMenu || !hamburgerBtn) return;
    mobileMenu.classList.add("open");
    if (mobileBackdrop) mobileBackdrop.classList.add("open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.setAttribute("aria-label", "Close navigation menu");
    document.body.style.overflow = "hidden"; // prevent scroll behind drawer
}

function closeMobileMenu() {
    if (!mobileMenu || !hamburgerBtn) return;
    mobileMenu.classList.remove("open");
    if (mobileBackdrop) mobileBackdrop.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Open navigation menu");
    document.body.style.overflow = "";
}

// Close drawer on Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
    }
});

// -------------------------------------------------------
// ACTIVE NAV LINK
// Highlights the link that matches the current page
// -------------------------------------------------------

// -------------------------------------------------------
// PAGE NAME HELPER
// Vercel's cleanUrls strips .html from the URL, so the
// pathname ends with "post" instead of "post.html".
// This function returns the page name WITH .html so all
// page comparisons work on both local and Vercel.
// -------------------------------------------------------
function getCurrentPageName() {
    var raw = window.location.pathname.split("/").pop() || "";
    // If it already has an extension, return as-is
    if (raw.indexOf(".") !== -1) return raw;
    // Map clean URL slugs back to their .html filenames
    if (raw === "" || raw === "index") return "index.html";
    return raw + ".html";
}

// Make it available globally so interactions.js and posts.js can use it
window.getCurrentPageName = getCurrentPageName;

// Get the current page filename (works with and without .html extension)
const currentPage = getCurrentPageName();

// Find all navigation links
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function (link) {
    // Get the href of the link (e.g. "explore.html")
    const linkHref = link.getAttribute("href");

    // If this link matches the current page, mark it as active
    if (linkHref === currentPage) {
        link.classList.add("active");
    }

    // Special case: homepage
    if ((currentPage === "index.html" || currentPage === "") && linkHref === "index.html") {
        link.classList.add("active");
    }
});

// -------------------------------------------------------
// NOTIFICATIONS DROPDOWN
// -------------------------------------------------------

const notifBtn      = document.getElementById("notifBtn");
const notifDropdown = document.getElementById("notifDropdown");
const notifClear    = document.getElementById("notifClear");

// When the bell icon is clicked, show/hide the dropdown
if (notifBtn && notifDropdown) {

    notifBtn.addEventListener("click", function (event) {
        // Stop the click from bubbling up so the outside-click handler doesn't close it immediately
        event.stopPropagation();

        const isOpen = notifDropdown.classList.contains("open");

        if (isOpen) {
            notifDropdown.classList.remove("open");
        } else {
            notifDropdown.classList.add("open");
            // Use the user-aware renderer if auth.js has loaded it,
            // otherwise fall back to the static sample notifications
            if (typeof renderUserNotifications === "function") {
                renderUserNotifications();
            } else {
                renderNotifications();
            }
        }
    });

    // Close notifications when clicking anywhere outside
    document.addEventListener("click", function (event) {
        const clickedInside = event.target.closest(".notif-wrapper");
        if (!clickedInside) {
            notifDropdown.classList.remove("open");
        }
    });
}

// Render notification items from the data
function renderNotifications() {
    const list = document.getElementById("notifList");
    if (!list || typeof notifications === "undefined") return;

    // Build the HTML for each notification
    let html = "";

    notifications.forEach(function (notif) {
        // Add "unread" class for unread notifications
        const unreadClass = notif.read ? "" : "unread";

        html += `
            <div class="notif-item ${unreadClass}">
                <div class="notif-icon">
                    <i class="fa-solid ${notif.icon}" aria-hidden="true"></i>
                </div>
                <div class="notif-text">
                    <p>${notif.message}</p>
                    <small>${notif.time}</small>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

// Clear all notifications
if (notifClear) {
    notifClear.addEventListener("click", function () {
        const list = document.getElementById("notifList");
        if (list) {
            // Remove the unread badge from the bell button
            const badge = document.querySelector(".notif-badge");
            if (badge) badge.style.display = "none";

            list.innerHTML = `
                <div class="empty-state" style="padding: 24px;">
                    <i class="fa-regular fa-bell" aria-hidden="true"></i>
                    <p>No new notifications</p>
                </div>
            `;
        }
    });
}

// -------------------------------------------------------
// NAVBAR SEARCH (desktop search bar in nav)
// Routes to the homepage with a search query
// -------------------------------------------------------

const navSearchInput = document.getElementById("navSearchInput");

if (navSearchInput) {
    navSearchInput.addEventListener("keydown", function (event) {
        // When the user presses Enter in the search box
        if (event.key === "Enter") {
            const query = navSearchInput.value.trim();

            if (query !== "") {
                // Go to the homepage and pass the search as a URL parameter
                window.location.href = "index.html?search=" + encodeURIComponent(query);
            }
        }
    });
}

// Also check for a search in the mobile menu
const mobileSearchInput = document.getElementById("mobileSearchInput");

if (mobileSearchInput) {
    mobileSearchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const query = mobileSearchInput.value.trim();

            if (query !== "") {
                window.location.href = "index.html?search=" + encodeURIComponent(query);
            }
        }
    });
}

// -------------------------------------------------------
// SCROLL TO TOP BUTTON
// Appears when the user scrolls down the page
// -------------------------------------------------------

const scrollTopBtn = document.getElementById("scrollTopBtn");

// Listen for scroll events on the window
window.addEventListener("scroll", function () {
    if (!scrollTopBtn) return;

    // If the user has scrolled down more than 400px, show the button
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add("visible");
    } else {
        scrollTopBtn.classList.remove("visible");
    }
});

// When the button is clicked, scroll back to the top smoothly
if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// -------------------------------------------------------
// TOAST NOTIFICATION
// Shows a small message at the bottom of the screen
// -------------------------------------------------------

// Get the toast element (or create one if it doesn't exist)
function showToast(message, duration) {
    duration = duration || 2500;

    // Find an existing toast or create one
    let toast = document.getElementById("toastMessage");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toastMessage";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }

    // Set the message
    toast.textContent = message;

    // Show the toast
    toast.classList.add("show");

    // Hide the toast after the duration
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
        toast.classList.remove("show");
    }, duration);
}

// Make showToast available globally so other scripts can use it
window.showToast = showToast;

// -------------------------------------------------------
// LOCAL STORAGE HELPERS
// Simple functions to save and load data
// Other scripts can use these helpers
// -------------------------------------------------------

// Save data to localStorage (converts objects/arrays to string)
function saveToStorage(key, value) {
    localStorage.setItem("oblog-" + key, JSON.stringify(value));
}

// Load data from localStorage (converts string back to object/array)
function loadFromStorage(key, defaultValue) {
    const stored = localStorage.getItem("oblog-" + key);

    // If nothing was saved before, return the default value
    if (stored === null) {
        return defaultValue;
    }

    // Convert the string back to a JavaScript object or array
    try {
        return JSON.parse(stored);
    } catch (e) {
        return defaultValue;
    }
}

// Make these helpers available globally
window.saveToStorage  = saveToStorage;
window.loadFromStorage = loadFromStorage;

// -------------------------------------------------------
// URL PARAMETER HELPER
// Reads a value from the URL (e.g. ?postId=3)
// -------------------------------------------------------

function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Make it globally available
window.getUrlParam = getUrlParam;

// -------------------------------------------------------
// PAGE INITIALISATION
// Runs when the page finishes loading
// -------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    // Set the correct theme icon based on saved preference
    const isDark = document.body.classList.contains("dark-mode");
    updateThemeIcon(isDark);

    // Add a subtle box shadow to the navbar when scrolled
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 10) {
                navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
            } else {
                navbar.style.boxShadow = "none";
            }
        });
    }
});
