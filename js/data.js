// ============================================================
// data.js — OBlog Sample Data & First-Run Seeding
// Keeps all original sample data constants AND seeds them
// into localStorage (oblogPosts / oblogUsers) on first run.
// ============================================================

// -------------------------------------------------------
// SAMPLE AUTHORS (kept for display fallback)
// -------------------------------------------------------
const authors = [
    {
        id: "sample_1",
        name: "Olamide Olatunde",
        username: "olamide",
        bio: "Junior Developer passionate about web technologies and open source.",
        skills: ["HTML", "CSS", "JavaScript", "TypeScript"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olamide",
        followers: [],
        following: [],
        posts: 24,
        joined: "January 2025"
    },
    {
        id: "sample_2",
        name: "Sarah Chen",
        username: "sarahdev",
        bio: "Frontend engineer who loves CSS, design systems, and building things that look great.",
        skills: ["CSS", "Design", "React", "Figma"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        followers: [],
        following: [],
        posts: 47,
        joined: "March 2024"
    },
    {
        id: "sample_3",
        name: "John Adeyemi",
        username: "johnadeyemi",
        bio: "Full-stack developer. I write about Node.js, databases, and backend architecture.",
        skills: ["Node.js", "JavaScript", "MongoDB", "Express"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        followers: [],
        following: [],
        posts: 63,
        joined: "June 2023"
    },
    {
        id: "sample_4",
        name: "Amara Nwosu",
        username: "amaracodes",
        bio: "Software engineering student. Learning in public every day.",
        skills: ["Python", "HTML", "CSS", "JavaScript"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
        followers: [],
        following: [],
        posts: 15,
        joined: "September 2025"
    },
    {
        id: "sample_5",
        name: "David Kim",
        username: "davidkim",
        bio: "Tech blogger and career coach. Helping developers land their first job.",
        skills: ["Career", "Programming", "JavaScript", "React"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        followers: [],
        following: [],
        posts: 91,
        joined: "January 2023"
    },
    {
        id: "sample_6",
        name: "Priya Sharma",
        username: "priyabuilds",
        bio: "UI/UX designer turned developer. I love accessible and beautiful interfaces.",
        skills: ["Design", "CSS", "HTML", "Accessibility"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        followers: [],
        following: [],
        posts: 38,
        joined: "May 2024"
    }
];

// -------------------------------------------------------
// SAMPLE POSTS (source of truth for first-run seeding)
// All likes are now arrays of user IDs (not a plain number)
// -------------------------------------------------------
const samplePosts = [
    {
        id: "post_sample_1",
        authorId: "sample_1",
        author: "Olamide Olatunde",
        username: "olamide",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olamide",
        title: "How I Started Learning JavaScript",
        description: "JavaScript looked difficult when I started, but learning the basics made everything easier. Here's my honest journey.",
        content: `
            <p>When I first opened a JavaScript tutorial, I was immediately overwhelmed. Functions, loops, objects — it all felt like a foreign language. But I kept going, and I'm glad I did.</p>
            <h2>Starting With the Basics</h2>
            <p>The best advice I received was to start simple. I didn't try to build an app on day one. I spent my first week just understanding variables, strings, and numbers. Simple things like:</p>
            <pre><code>let name = "Olamide";
console.log("Hello, " + name);</code></pre>
            <p>That small piece of code running in the browser felt like magic. It motivated me to keep going.</p>
            <h2>Building Real Things</h2>
            <p>The turning point was building my first real project — a simple to-do list. It wasn't pretty, but it worked. I used <code>getElementById</code>, <code>addEventListener</code>, and arrays for the first time. Everything clicked.</p>
            <h2>Mistakes I Made</h2>
            <ul>
                <li>Trying to learn too many things at once</li>
                <li>Skipping the fundamentals and jumping to frameworks</li>
                <li>Not practising enough — reading without coding</li>
            </ul>
            <h2>My Advice to Beginners</h2>
            <p>Be patient. Every developer you look up to was once a beginner who couldn't get a loop to work. Keep building. Keep making mistakes. The progress will come.</p>
            <p>If you're just starting out — welcome. You belong here.</p>
        `,
        tags: ["JavaScript", "WebDevelopment", "Beginners"],
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "5 min read",
        date: "2 hours ago",
        type: "article",
        featured: true,
        status: "published",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_2",
        authorId: "sample_2",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        title: "5 CSS Tricks Every Beginner Should Know",
        description: "Simple CSS techniques that will instantly make your websites look better and more professional.",
        content: `
            <p>CSS can feel tricky at first, but a few key techniques go a very long way. Here are five tricks I wish I knew when I started.</p>
            <h2>1. CSS Custom Properties (Variables)</h2>
            <p>Stop repeating colour values all over your stylesheet. Use variables instead:</p>
            <pre><code>:root {
    --primary: #111111;
    --accent: #2563EB;
}
button {
    background: var(--primary);
}</code></pre>
            <h2>2. Flexbox for Centering</h2>
            <p>Centering things vertically used to be a nightmare. Flexbox makes it trivial:</p>
            <pre><code>.container {
    display: flex;
    justify-content: center;
    align-items: center;
}</code></pre>
            <h2>3. CSS Grid for Layouts</h2>
            <pre><code>.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}</code></pre>
            <h2>4. Smooth Transitions</h2>
            <pre><code>button { transition: all 0.2s ease; }
button:hover { transform: translateY(-2px); }</code></pre>
            <h2>5. Clamp for Responsive Typography</h2>
            <pre><code>h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); }</code></pre>
            <p>These five techniques will immediately improve your CSS. Try them in your next project!</p>
        `,
        tags: ["CSS", "Design", "WebDevelopment"],
        image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "4 min read",
        date: "5 hours ago",
        type: "article",
        featured: true,
        status: "published",
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_3",
        authorId: "sample_3",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        title: "Understanding the DOM: A Beginner's Guide",
        description: "The DOM is the foundation of all JavaScript interactivity in the browser. Let's break it down simply.",
        content: `
            <p>The DOM — Document Object Model — is how JavaScript sees and interacts with your HTML page. Understanding it is the key to making things happen in the browser.</p>
            <h2>What is the DOM?</h2>
            <p>When a browser loads your HTML, it creates a tree of objects — one for each element. This tree is the DOM. JavaScript can read and change this tree in real time.</p>
            <h2>Selecting Elements</h2>
            <pre><code>let title = document.getElementById("title");
let cards = document.querySelectorAll(".card");
let button = document.querySelector(".btn");</code></pre>
            <h2>Changing Content</h2>
            <pre><code>title.textContent = "Hello, World!";
title.innerHTML = "&lt;strong&gt;Bold Title&lt;/strong&gt;";</code></pre>
            <h2>Responding to Clicks</h2>
            <pre><code>button.addEventListener("click", function() {
    alert("Button clicked!");
});</code></pre>
            <p>That's the core of DOM manipulation. Everything else builds on these simple ideas.</p>
        `,
        tags: ["JavaScript", "DOM", "Beginners", "WebDevelopment"],
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "6 min read",
        date: "1 day ago",
        type: "article",
        featured: false,
        status: "published",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_4",
        authorId: "sample_5",
        author: "David Kim",
        username: "davidkim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        title: "How to Land Your First Developer Job in 2026",
        description: "Practical, honest advice on what hiring managers are actually looking for — and how to stand out.",
        content: `
            <p>Getting your first developer job is hard. But with the right approach, it's absolutely achievable. Here's what actually works.</p>
            <h2>Build Projects, Not Certificates</h2>
            <p>Certificates help, but projects are what get you hired. Build three to five real projects and put them on GitHub.</p>
            <h2>Learn to Talk About Your Work</h2>
            <p>Be able to explain what each project does, why you built it, what problems you solved, and what you would do differently.</p>
            <h2>Apply Early and Apply Often</h2>
            <p>Don't wait until you feel "ready." You will never feel 100% ready. Start applying when you have a solid foundation.</p>
            <h2>Use LinkedIn Properly</h2>
            <p>Keep your LinkedIn updated, connect with developers in your area, and post about what you're learning.</p>
            <h2>Don't Give Up</h2>
            <p>Most developers get rejected dozens of times before landing their first role. Every rejection is useful feedback.</p>
        `,
        tags: ["Career", "Programming", "Jobs"],
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "7 min read",
        date: "2 days ago",
        type: "article",
        featured: true,
        status: "published",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_5",
        authorId: "sample_6",
        author: "Priya Sharma",
        username: "priyabuilds",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        title: "Why Accessibility Matters in Web Development",
        description: "Building accessible websites isn't just the right thing to do — it makes your product better for everyone.",
        content: `
            <p>Accessibility often gets treated as an afterthought. But when you build with accessibility in mind from the start, you build better products for everyone.</p>
            <h2>What is Web Accessibility?</h2>
            <p>Web accessibility means designing and building websites that can be used by people with disabilities — including those who use screen readers, keyboard navigation, or other assistive technologies.</p>
            <h2>Simple Steps That Make a Big Difference</h2>
            <h3>Use Semantic HTML</h3>
            <pre><code>&lt;!-- Bad --&gt;
&lt;div class="button"&gt;Click me&lt;/div&gt;
&lt;!-- Good --&gt;
&lt;button&gt;Click me&lt;/button&gt;</code></pre>
            <h3>Add Alt Text to Images</h3>
            <pre><code>&lt;img src="photo.jpg" alt="A developer typing at a keyboard"&gt;</code></pre>
            <h3>Label Your Forms</h3>
            <pre><code>&lt;label for="email"&gt;Email address&lt;/label&gt;
&lt;input type="email" id="email"&gt;</code></pre>
            <p>Around 15% of the world's population has some form of disability. Start small — semantic HTML alone gets you most of the way there.</p>
        `,
        tags: ["Accessibility", "HTML", "WebDevelopment", "Design"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "5 min read",
        date: "3 days ago",
        type: "article",
        featured: false,
        status: "published",
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_6",
        authorId: "sample_4",
        author: "Amara Nwosu",
        username: "amaracodes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
        title: "My 30-Day Coding Challenge: What I Learned",
        description: "I coded every single day for 30 days. Here's an honest look at what worked, what didn't, and whether it was worth it.",
        content: `
            <p>I decided to do the #100DaysOfCode challenge — well, the 30-day version to start. Here's what happened.</p>
            <h2>Week 1: Motivation Was Easy</h2>
            <p>The first week was exciting. I was posting on social media, building small projects, and learning something new every day.</p>
            <h2>Week 2: The Hard Part</h2>
            <p>Life got in the way. Some days I only coded for 20 minutes. And that's okay.</p>
            <h2>Week 3: Getting Into a Rhythm</h2>
            <p>By week three, coding became a habit rather than a task.</p>
            <h2>Week 4: Seeing Progress</h2>
            <p>Looking back at my week-one code in week four was eye-opening. I went from struggling with loops to building a functional quiz app.</p>
            <h2>Was It Worth It?</h2>
            <p>Absolutely. The discipline alone was worth it. I'd recommend a coding challenge to any beginner.</p>
        `,
        tags: ["Career", "JavaScript", "Beginners", "Programming"],
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "4 min read",
        date: "4 days ago",
        type: "article",
        featured: false,
        status: "published",
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_7",
        authorId: "sample_2",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        title: "CSS Grid vs Flexbox: When to Use Each",
        description: "Both are powerful layout tools, but they solve different problems. Here's a clear guide on when to reach for each one.",
        content: `
            <p>CSS Grid and Flexbox are both fantastic. But they're designed for different situations.</p>
            <h2>Flexbox is for One Direction</h2>
            <p>Use Flexbox when your layout flows in one direction — either a row or a column.</p>
            <pre><code>nav { display: flex; align-items: center; gap: 16px; }</code></pre>
            <h2>Grid is for Two Dimensions</h2>
            <p>Use Grid when your layout needs rows AND columns simultaneously.</p>
            <pre><code>.cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}</code></pre>
            <h2>The Simple Rule</h2>
            <ul>
                <li>One direction? Use Flexbox.</li>
                <li>Two dimensions? Use Grid.</li>
                <li>Both? Use both — they work together perfectly.</li>
            </ul>
        `,
        tags: ["CSS", "WebDevelopment", "Design"],
        image: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "4 min read",
        date: "5 days ago",
        type: "article",
        featured: false,
        status: "published",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "post_sample_8",
        authorId: "sample_3",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        title: "Local Storage: Saving Data Without a Backend",
        description: "localStorage is a powerful browser feature that lets you save data on the user's device. Here's everything you need to know.",
        content: `
            <p>No backend? No problem. localStorage lets you save data right in the user's browser.</p>
            <h2>What is localStorage?</h2>
            <p>localStorage is a browser feature that lets you store key-value pairs on a user's device. The data stays even after the browser is closed.</p>
            <h2>Saving Data</h2>
            <pre><code>localStorage.setItem("username", "olamide");
localStorage.setItem("theme", "dark");</code></pre>
            <h2>Getting Data</h2>
            <pre><code>let username = localStorage.getItem("username");
console.log(username); // "olamide"</code></pre>
            <h2>Saving Objects</h2>
            <pre><code>let posts = ["Post 1", "Post 2"];
localStorage.setItem("posts", JSON.stringify(posts));
let saved = JSON.parse(localStorage.getItem("posts"));</code></pre>
            <h2>Removing Data</h2>
            <pre><code>localStorage.removeItem("username");
localStorage.clear();</code></pre>
        `,
        tags: ["JavaScript", "WebDevelopment", "Beginners"],
        image: "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=800&q=80",
        likes: [],
        comments: [],
        shares: 0,
        readTime: "6 min read",
        date: "1 week ago",
        type: "article",
        featured: false,
        status: "published",
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    }
];

// -------------------------------------------------------
// SAMPLE DISCUSSIONS (kept for discussions.html)
// -------------------------------------------------------
const discussions = [
    {
        id: "disc_1",
        author: "Olamide Olatunde",
        username: "olamide",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olamide",
        title: "How did you learn JavaScript?",
        body: "I'm curious — what learning resources, courses, or approaches worked best for you when learning JavaScript?",
        likes: [],
        comments: 22,
        date: "3 hours ago",
        tags: ["JavaScript", "Learning"]
    },
    {
        id: "disc_2",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        title: "What is your favourite code editor and why?",
        body: "VS Code seems to be everywhere, but I know plenty of developers swear by other editors. What do you use?",
        likes: [],
        comments: 38,
        date: "6 hours ago",
        tags: ["Tools", "Programming"]
    },
    {
        id: "disc_3",
        author: "David Kim",
        username: "davidkim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        title: "What programming language should absolute beginners learn first?",
        body: "There are so many opinions on this. Python, JavaScript, Scratch? What do you think is the best first language?",
        likes: [],
        comments: 64,
        date: "1 day ago",
        tags: ["Beginners", "Programming", "Career"]
    },
    {
        id: "disc_4",
        author: "Amara Nwosu",
        username: "amaracodes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
        title: "How do you stay motivated when learning gets hard?",
        body: "I've been learning for three months and I just hit a wall. How do experienced developers push through these moments?",
        likes: [],
        comments: 29,
        date: "2 days ago",
        tags: ["Career", "Learning", "Motivation"]
    },
    {
        id: "disc_5",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        title: "How do you prepare for developer interviews?",
        body: "I have my first technical interview coming up next week. What resources, strategies, or practice methods do you recommend?",
        likes: [],
        comments: 41,
        date: "3 days ago",
        tags: ["Career", "Jobs", "Programming"]
    },
    {
        id: "disc_6",
        author: "Priya Sharma",
        username: "priyabuilds",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        title: "Is it worth learning web accessibility as a beginner?",
        body: "Some people say focus on getting the basics working first. Others say build accessible from the start. What's your experience?",
        likes: [],
        comments: 17,
        date: "5 days ago",
        tags: ["Accessibility", "WebDevelopment", "Beginners"]
    }
];

// -------------------------------------------------------
// SAMPLE VIDEOS (kept for videos.html)
// -------------------------------------------------------
const videos = [
    {
        id: 1,
        title: "JavaScript Basics for Beginners",
        author: "Olamide Olatunde",
        username: "olamide",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olamide",
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80",
        views: "1.2K",
        duration: "08:34",
        date: "1 week ago",
        tags: ["JavaScript", "Beginners"]
    },
    {
        id: 2,
        title: "CSS Flexbox Complete Guide",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80",
        views: "3.4K",
        duration: "12:10",
        date: "2 weeks ago",
        tags: ["CSS", "Design"]
    },
    {
        id: 3,
        title: "Build a Portfolio Website From Scratch",
        author: "David Kim",
        username: "davidkim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80",
        views: "5.8K",
        duration: "24:45",
        date: "3 weeks ago",
        tags: ["HTML", "CSS", "Career"]
    },
    {
        id: 4,
        title: "How the DOM Works Explained Simply",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
        views: "2.1K",
        duration: "10:22",
        date: "1 month ago",
        tags: ["JavaScript", "DOM"]
    },
    {
        id: 5,
        title: "Accessibility in Web Design 101",
        author: "Priya Sharma",
        username: "priyabuilds",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
        views: "980",
        duration: "07:15",
        date: "1 month ago",
        tags: ["Accessibility", "Design"]
    },
    {
        id: 6,
        title: "My First Developer Interview: What I Wish I Knew",
        author: "Amara Nwosu",
        username: "amaracodes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        views: "4.5K",
        duration: "15:33",
        date: "2 months ago",
        tags: ["Career", "Programming"]
    }
];

// -------------------------------------------------------
// SAMPLE PHOTOS (kept for photos.html)
// -------------------------------------------------------
const photos = [
    {
        id: 1,
        title: "Developer workspace setup",
        author: "Olamide Olatunde",
        username: "olamide",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olamide",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
        likes: [],
        date: "1 day ago",
        tags: ["Workspace", "Setup"]
    },
    {
        id: 2,
        title: "Late night coding session",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80",
        likes: [],
        date: "2 days ago",
        tags: ["Coding", "Night"]
    },
    {
        id: 3,
        title: "Project launch celebration",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
        likes: [],
        date: "3 days ago",
        tags: ["Community", "Event"]
    },
    {
        id: 4,
        title: "My first app screenshot",
        author: "Amara Nwosu",
        username: "amaracodes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
        likes: [],
        date: "1 week ago",
        tags: ["App", "Project"]
    },
    {
        id: 5,
        title: "Tech conference 2026",
        author: "David Kim",
        username: "davidkim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
        likes: [],
        date: "2 weeks ago",
        tags: ["Event", "Technology"]
    },
    {
        id: 6,
        title: "Minimal desk for focused work",
        author: "Priya Sharma",
        username: "priyabuilds",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
        likes: [],
        date: "2 weeks ago",
        tags: ["Workspace", "Design"]
    },
    {
        id: 7,
        title: "Code on dual monitors",
        author: "John Adeyemi",
        username: "johnadeyemi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
        likes: [],
        date: "3 weeks ago",
        tags: ["Setup", "Coding"]
    },
    {
        id: 8,
        title: "Team working together",
        author: "Sarah Chen",
        username: "sarahdev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
        likes: [],
        date: "1 month ago",
        tags: ["Community", "Team"]
    }
];

// -------------------------------------------------------
// TOPICS (kept for explore page)
// -------------------------------------------------------
const topics = [
    { name: "JavaScript",     count: 142, icon: "fa-js" },
    { name: "HTML",           count: 89,  icon: "fa-html5" },
    { name: "CSS",            count: 97,  icon: "fa-css3-alt" },
    { name: "WebDevelopment", count: 215, icon: "fa-globe" },
    { name: "React",          count: 78,  icon: "fa-react" },
    { name: "Career",         count: 63,  icon: "fa-briefcase" },
    { name: "Programming",    count: 185, icon: "fa-code" },
    { name: "Design",         count: 54,  icon: "fa-pen-nib" },
    { name: "Beginners",      count: 112, icon: "fa-star" },
    { name: "Accessibility",  count: 31,  icon: "fa-universal-access" },
    { name: "Node.js",        count: 45,  icon: "fa-node" },
    { name: "Technology",     count: 98,  icon: "fa-microchip" }
];

// -------------------------------------------------------
// FIRST-RUN SEEDING
// Seeds oblogPosts and oblogUsers into localStorage the
// very first time the app is opened. Never runs again.
// -------------------------------------------------------
(function seedOnFirstRun() {

    // --- Seed Posts ---
    // Only seed if oblogPosts hasn't been set yet
    const existingPosts = localStorage.getItem("oblogPosts");

    if (!existingPosts) {
        // Save the sample posts into localStorage
        localStorage.setItem("oblogPosts", JSON.stringify(samplePosts));
        console.log("OBlog: Sample posts seeded to localStorage.");
    }

    // --- Seed Sample Users ---
    // Only seed if oblogUsers hasn't been set yet
    const existingUsers = localStorage.getItem("oblogUsers");

    if (!existingUsers) {
        // Create simple sample user accounts so the sample posts have real authors
        const sampleUsers = authors.map(function (a) {
            return {
                id:        a.id,
                name:      a.name,
                username:  a.username,
                email:     a.username + "@oblog.com",
                password:  "password123",
                bio:       a.bio,
                avatar:    a.avatar,
                location:  "",
                website:   "",
                followers: [],
                following: [],
                createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
            };
        });

        localStorage.setItem("oblogUsers", JSON.stringify(sampleUsers));
        console.log("OBlog: Sample users seeded to localStorage.");
    }

})();

// -------------------------------------------------------
// BACKWARD COMPATIBILITY
// The old code used a const called `posts`.
// We keep it pointing to the live data from localStorage
// so nothing breaks. posts.js merges this with user posts.
// -------------------------------------------------------
// We read from localStorage here so the `posts` variable
// always reflects the current state (including any likes
// or comments that have been added).
var posts = JSON.parse(localStorage.getItem("oblogPosts")) || samplePosts;
