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
        database: "project_api"
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
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html')
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




app.use("/register", (req, res, next) => {
    const data = req.body;
    let message = "L'une ou plusieurs des donnée(s) ";
    if (data.firstname == undefined || data.firstname.trim().length == 0 ||
        data.lastname == undefined || data.lastname.trim().length == 0 ||
        data.dateNaiss == undefined || data.dateNaiss.trim().length == 0 ||
        data.sexe == undefined || data.sexe.trim().length == 0 ||
        data.type == undefined || data.type.trim().length == 0
    ) {
        message =
            message.substr(0, message.length - 1) + " sont manquante(s)";
        sendReturn(res, 403, message);

    } else if (
        data.dateNaiss.match(
            /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
        ) == null ||
        data.sexe !== "Femme" && data.sexe !== "Homme" ||
        data.type !== "Etudiant" && data.type !== "Intervenant"
    ) {
        message =
            message.substr(0, message.length - 1) + " ne sont pas conformes";
        sendReturn(res, 409, message);
    } else if (filterEmailPassword(req, res)) next();
});

/** 
 *- Toute les erreur: Donnée manquante sont en code 403 
 *- Toute les erreur: Trop de tentative sur email sont en code 429 
 *- Toute les erreur: Donnée non-conforme sont en code 409 
 *- Toute les erreur: Donnée format erronée sont en code 400 
 *- Toute les erreur: Donnée non-valide sont en code 409 
 *- Toute les erreur: Nom existe sont en code 422 
 *- Toute les erreur: Nombre de place atteinte sont en code 400 
 */

const filterEmailPassword = (req, res) => {
    const data = req.body;
    let message = "L'une ou plusieurs des donnée(s) ";
    if (
        data.email == undefined || data.email.trim().length == 0 ||
        data.password == undefined || data.password.trim().length == 0
    ) {
        message =
            message.substr(0, message.length - 1) + " sont manquante(s)";
        sendReturn(res, 403, message);
    } else if (
        data.email.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) == null
    ) {
        message = "votre email n'est pas correct";
        sendReturn(res, 400, message);
    } else return true;
};



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
                    date_naissance: dateN,
                    sexe: data.sexe.trim(),
                    type: data.type.trim(),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
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


app.listen(port);