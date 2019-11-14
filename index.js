const express = require("express"), // Express - System route pour REST API
    mysql = require("mysql"), // Package de connection BDD MySqli
    bodyParser = require("body-parser"), // Middleware pour la data das le body
    bcrypt = require("bcryptjs"), // Une bibliothèque pour vous aider à hacher les mots de passe
    app = express(), // Création d'un application REST
    port = 3000, // Port de connection
    connect = mysql.createConnection({
        host: "localhost",
        user: "roott",
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

app.post("/login", (req, res) => {
    const data = req.body;
    connect.query(
        "SELECT * FROM users WHERE email = ?", [data.email],
        (error, results) => {
            if (error) sendReturn(res);
            else if (results.length == 0)
                sendReturn(res, 418, {
                    error: true,
                    message: "Password/Email doesn't exist"
                });
            else {
                //bcrypt.compare(data.password, results[0].password, (isOK) =>{})
                // Comparaison du password via le hash de la BDD
                bcrypt.compare(data.password, results[0].password).then(isOk => {
                    if (isOk) getUsers(res, "where idusers = " + results[0].idusers);
                    else {
                        sendReturn(res, 418, {
                            error: true,
                            message: "Password/Email doesn't exist"
                        });
                    }
                });
            }
        }
    );
});

app.get("/user/:id", (req, res) => {
    // Test id est envoyez
    if (req.params.id === undefined) sendReturn(res);
    // Test id est numérique
    else if (req.params.id.match(/^[0-9]*$/gm) == null) sendReturn(res);
    else getUsers(res, "where idusers = " + req.params.id);
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

app.delete("/user/:id", (req, res) => {
    const id = req.params.id;
    if (id === undefined) sendReturn(res);
    else if (id.match(/^[0-9]*$/gm) == null) sendReturn(res);
    else
        connect.query(
            "DELETE FROM `users` WHERE `users`.`idusers` = ?", [id],
            (err, result) => {
                // Suppression d'un user via id
                if (err) sendReturn(res, 200, err);
                sendReturn(res, 200, {
                    error: false,
                    message: "Users delete"
                });
            }
        );
});

app.get("/users", (req, res) => getUsers(res));
app.delete("/users", (req, res) =>
    connect.query("TRUNCATE users", (err, result) => {
        // Suppression de la totalité de la base de donnée
        if (err) sendReturn(res, 200, err);
        sendReturn(res, 200, {
            error: false,
            message: "All users delete"
        });
    })
);

/**
 * Recuperation des utilisateurs
 * @param {Response} res
 * @param {String} where
 * @param {Number} port
 */
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

/**
 * Management of messages send to the Customer
 * @param {Response} res
 * @param {Number} status
 * @param {Object} data
 */
const sendReturn = (
    res,
    status = 500,
    data = {
        error: true,
        message: "Processing error"
    }
) => {
    res.setHeader("Content-Type", "application/json"); // Typage de la data de retour
    res.status(status).json(data);
};

const filterEmailPassword = (req, res) => {
    const data = req.body;
    let message = "La/Les donnée(s) ";
    if (
        data.email == undefined ||
        data.email.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) == null
    )
        message += "email, ";
    if (data.password == undefined || data.password.trim().length == 0)
        message += "mot de passe, ";
    if (message.length > 17) {
        message =
            message.substr(0, message.length - 2) + " sont manquante(s) ou erroné(s)";
        sendReturn(res, 403, message);
    } else return true;
};

app.listen(port, () => console.log(`Run api listening on localhost:3000 !`));