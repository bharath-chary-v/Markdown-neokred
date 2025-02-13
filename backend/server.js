const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const allowedOrigins = [
    "http://localhost:3000", 
    "https://markdown-neokred.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }   
    }
}));

function parseMarkdown(markdown) {
    return markdown
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*)\*/gim, "<i>$1</i>")
        .replace(/`(.*?)`/gim, "<code>$1</code>")
        .replace(/> (.*$)/gim, "<blockquote>$1</blockquote>")
        .replace(/\[([^\[]+)\]\((.*)\)/gim, '<a href="$2">$1</a>')
        .replace(/\!\[([^\[]+)\]\((.*)\)/gim, '<img src="$2" alt="$1"/>')
        .replace(/\n{2,}/g, "</p><p>")  
        .replace(/\n/g, " "); 
}

app.post("/convert", (req, res) => {
    try {
        const { markdown } = req.body;
        if (!markdown) throw new Error("No markdown provided");

        const html = parseMarkdown(markdown);
        res.json({ html });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));