const express = require("express"), // Express - System route pour REST API
    mysql = require("mysql"), // Package de connection BDD MySqli
    bodyParser = require("body-parser"), // Middleware pour la data das le body
    bcrypt = require("bcryptjs"), // Une bibliothèque pour vous aider à hacher les mots de passe
    app = express(), // Création d'un application REST
    port = 3000, // Port de connection
    connect = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "projet_api"
    });

// Connect to BDD
connect.connect(err => {
    if (err) console.error("Error connecting MySQL: " + err.stack);
});

// parse application/x-www-form-urlencoded
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// Middleware de connection
app.use("/login", (req, res, next) => {
    if (filterEmailPassword(req, res)) next();
});
app.get("/", (req, res) => {
    req.rander('index.ejs')
});




app.post("/login", (req, res) => {
    const data = req.body;
    connect.query(
        "SELECT * FROM users WHERE email = ?", [data.email],
        (error, results) => {
            if (error) sendReturn(res);
            else if (results.length == 0)
                sendReturn(res, 401, {
                    error: true,
                    message: "L'email/password est manquant"
                });
            else {
                //bcrypt.compare(data.password, results[0].password, (isOK) =>{})
                // Comparaison du password via le hash de la BDD
                bcrypt.compare(data.password, results[0].password).then(isOk => {
                    sendReturn(res, 401, {
                            if (isOk) getUsers(res, "where idusers = " + results[0].idusers);
                            else {
                                error: true,
                                message: "Votre email/password est erroné"
                            });
                    }
                });
            }
        }
    );
});

const getUsers = (res, where = "", port = 200) =>
    connect.query("SELECT * FROM users " + where, (error, results) => {
        console.log("SELECT * FROM users " + where);
        if (error) sendReturn(res, 413, error);
        // Si erreur dans la requets
        else if (results === undefined) sendReturn(res);
        // Si le resultat n'existe pas
        else {
            if (port == 0) return results;
            // Si la récuperation est bonne
            results.map(item => {
                // Array.map => Foreach()
                delete item.idusers; // Suppression d'un elements
                delete item.password;
                return item; // Retour le nouvel element item => results[i] = item
            });
            sendReturn(res, port, {
                error: false,
                data: results
            });
        }
    });