const express = require("express"), // Express - System route pour REST API
    app = express(), // Création d'un application REST
    port = 3000 // Port de connection

app.get("/", (req, res) => {
    req.sendFile("index.html")
});