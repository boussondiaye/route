const express = require("express"), // Express - System route pour REST API
    mysql = require("mysql"), // Package de connection BDD MySqli
    bodyParser = require("body-parser"), // Middleware pour la data das le body
    bcrypt = require("bcryptjs"), // Une bibliothèque pour vous aider à hacher les mots de passe
    app = express(), // Création d'un application REST
    port = 3000, // Port de connection
    connect = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "api_nodejs"
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

// Middleware d'inscription
app.use("/register", (req, res, next) => {
    const data = req.body;
    let message = "La/Les donnée(s) ";
    if (data.firstname == undefined || data.firstname.trim().length == 0)
        message += "prenom, ";
    if (data.lastname == undefined || data.lastname.trim().length == 0)
        message += "nom, ";
    if (
        data.dateNaiss == undefined ||
        data.dateNaiss.trim().length == 0 ||
        data.dateNaiss.match(
            /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
        ) == null
    )
        message += "date de naissance, ";
    if (message.length > 17) {
        message =
            message.substr(0, message.length - 2) + " sont manquante(s) ou erroné(s)";
        sendReturn(res, 403, message);
    } else if (filterEmailPassword(req, res)) next();
});

/**
 * Fonction Anonyme
 * (req, res) => res.send("Hello World!")
 * function(req, res) {res.send("Hello World!")}
 */

app.get("/", (req, res) => {
    res.send("<h1>Hello Mike!</h1>");
});

app.post("/register", (req, res) => {
    const data = req.body;

    connect.query(
        "SELECT * FROM users WHERE email = '" +
        data.email.trim().toLowerCase() +
        "'",
        async(error, results) => {
            if (error) sendReturn(res);
            else if (results.length > 0)
                sendReturn(res, 418, {
                    error: true,
                    message: "Email is already used"
                });
            else {
                data.password = await new Promise(resolve => {
                    // Création d'une promesse
                    bcrypt.genSalt(10, async(err, salt) => {
                        // Création d'une salt
                        return await bcrypt.hash(data.password, salt, (err, hash) => {
                            // Hash du password
                            resolve(hash); // Envoi du password hash
                        });
                    });
                });

                const dateN =
                    data.dateNaiss.substr(6, 4) +
                    "-" +
                    data.dateNaiss.substr(3, 2) +
                    "-" +
                    data.dateNaiss.substr(0, 2);
                const insertData = {
                    firstname: data.firstname.trim(),
                    lastname: data.lastname.trim(),
                    password: data.password,
                    email: data.email.trim().toLowerCase(), // Sans espace et en minuscule
                    date_naissance: dateN
                };
                connect.query(
                    "INSERT INTO users SET ?",
                    insertData,
                    (error, results) => {
                        if (error) sendReturn(res);
                        getUsers(res, "WHERE email ='" + data.email + "'", 201);
                    }
                );
            }
        }
    );
});