# OBlog — Write. Share. Connect.

OBlog is a modern social blogging platform built as a frontend-only school assignment.

---

## Security Disclaimer

> OBlog uses browser localStorage to simulate accounts, authentication and data persistence for educational purposes. It is **not** a secure production authentication system. User data — including passwords — is stored in plain text locally in the browser and is not shared with any server, database, or other devices. Do not use real passwords here. This project exists solely to demonstrate JavaScript, DOM manipulation, and localStorage concepts.

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Homepage | `index.html` | Main feed with posts, search, topic filters |
| Post | `post.html` | Full post page with comments and replies |
| Create Post | `create-post.html` | Create or edit a post (requires login) |
| Explore | `explore.html` | Trending posts, topics, and authors |
| Discussions | `discussions.html` | Community Q&A and discussions |
| Videos | `videos.html` | Video section |
| Photos | `photos.html` | Photo gallery |
| Profile | `profile.html` | User profile with tabs (requires login) |
| Contact | `contact.html` | Contact form |
| Log In | `login.html` | Login page |
| Register | `register.html` | Account creation page |

---

## Features

### Account System
- Register a new account (name, username, email, password)
- Log in with username or email + password
- Stay logged in after browser refresh
- Log out from any page
- Multiple accounts in the same browser
- Edit profile (name, username, bio, location, avatar URL)

### Posts
- Browse posts on the homepage feed
- Filter by topic tags or sort by Latest / Popular
- Search posts by title, description, author, or tag
- Create new posts (article, photo, video, discussion)
- Edit your own posts
- Delete your own posts
- Full post page with article content

### Interactions
- Like / unlike posts (one like per user per post)
- Save / unsave posts (bookmark)
- Share posts (copy link to clipboard)
- Comment on posts
- Reply to comments
- Delete your own comments
- Follow / unfollow other users

### Profile
- View your own posts, saved posts, and comments
- Edit your profile information
- See follower / following / post counts

### Notifications
- Receive a notification when someone likes your post
- Receive a notification when someone follows you
- Receive a notification when someone comments on your post
- Notification badge on the bell icon
- Mark all notifications as read

### Other
- Dark mode / light mode (saved after refresh)
- Fully responsive (desktop, tablet, mobile)
- Accessible markup (semantic HTML, aria labels)

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `oblogUsers` | Array of registered user objects |
| `oblogCurrentUser` | ID string of the currently logged-in user |
| `oblogPosts` | Array of all posts (sample + user-created) |
| `oblogSavedPosts` | Array of `{ userId, postId }` bookmark pairs |
| `oblogNotifications` | Array of notification objects per user |
| `oblogDiscussions` | Array of user-created discussion posts |
| `oblogSampleDiscLikes` | Like tracking for sample discussions |
| `oblog-theme` | `"dark"` or `"light"` theme preference |

---

## Technology

- **HTML5** — semantic markup, accessibility attributes
- **CSS3** — custom properties, flexbox, grid, responsive breakpoints
- **Vanilla JavaScript** — DOM manipulation, events, arrays, objects, functions, localStorage

No frameworks. No build tools. No backend. Open `index.html` in any modern browser.

---

## Project Structure

```
OBlog/
├── index.html           Homepage
├── post.html            Full post reading page
├── create-post.html     Create / edit post
├── explore.html         Explore trending content
├── discussions.html     Community discussions
├── videos.html          Video section
├── photos.html          Photo gallery
├── profile.html         User profile
├── contact.html         Contact form
├── login.html           Log in page
├── register.html        Register page
│
├── css/
│   └── style.css        Complete design system
│
├── js/
│   ├── data.js          Sample data + first-run seeding
│   ├── auth.js          Account system (register, login, logout, session)
│   ├── app.js           Core shell (dark mode, nav, toast, storage helpers)
│   ├── interactions.js  Likes, saves, follows, comments, create/edit/delete
│   └── posts.js         Post rendering, feed, search, explore
│
├── images/
│   ├── avatars/
│   └── posts/
│
└── README.md
```

## Script Load Order (important)

Every HTML page loads scripts in this exact order:

```html
<script src="js/data.js"></script>      <!-- 1. Sample data + seed -->
<script src="js/auth.js"></script>      <!-- 2. Account system (exposes getCurrentUser etc.) -->
<script src="js/app.js"></script>       <!-- 3. Core shell (exposes showToast, saveToStorage etc.) -->
<script src="js/interactions.js"></script> <!-- 4. User interactions -->
<script src="js/posts.js"></script>     <!-- 5. Post rendering -->
```

`auth.js` must come before `app.js` because `app.js` calls `getCurrentUser()`.

---

## How to Run

1. Clone or download the project.
2. Open `index.html` in any modern browser.
3. No server, build step, or internet connection required (except for loading Google Fonts and Font Awesome from CDN).

---

## Test Accounts (seeded automatically)

Six sample author accounts are seeded on first run. You can log in as any of them:

| Username | Password |
|----------|----------|
| `olamide` | `password123` |
| `sarahdev` | `password123` |
| `johnadeyemi` | `password123` |
| `amaracodes` | `password123` |
| `davidkim` | `password123` |
| `priyabuilds` | `password123` |

Or register your own account from the Register page.

---

© 2026 OBlog. Built for educational purposes.
