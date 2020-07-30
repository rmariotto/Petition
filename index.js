const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc.js");
const csurf = require('csurf');

const {
    addUsers,
    getUser,
    addSignatures,
    getSignature,
    getSigners,
} = require("./db.js");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

//middleware
app.use(
    cookieSession({
        secret: `I'm always angry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(express.static("./public"));
app.use(express.static("canvas.js"));
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.set('x-frame-options', 'deny');
    res.locals.csrfToken = req.csrfToken();
    next();
});

//////////////ROUTES////////////////////////
app.get("/", (req, res) => {
    if (req.session.userId) {
        res.redirect('/petition');
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("register", {
            error: true,
        });
    }
});

app.post("/register", (req, res) => {
    console.log("POST register: ", req.body.email);
    const firstname = req.body.first_name;
    const lastname = req.body.last_name;
    const email = req.body.email;
    const userpassword = req.body.user_password;

    hash(userpassword)
        .then((hashedPw) => {
            return addUsers(firstname, lastname, email, hashedPw);
        })
        .then((result) => {
            req.session.userId = result.rows[0].id;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in POST /register: ", err);
            res.render("register", {
                error: true,
            });
        });
});


app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    console.log("POST login: ", req.body.email);
    const email = req.body.email;
    const userpassword = req.body.password;

    getUser(email).then((result) => {
        compare(userpassword, result.rows[0].user_password)
            .then((match) => {
                if (match) {
                    req.session.userId = result.rows[0].id;
                    res.redirect("/petition");
                } else {
                    res.render("login", { error: true });
                }
            })
            .catch((err) => {
                console.log(err);

                res.sendStatus(500);
            });
    });
});

app.get('/logout', (req, res) => {
    req.session.userId = null;
    res.redirect('/');
});


app.get("/petition", (req, res) => {
    console.log('petition req:');
    
    if (req.session.userId) {
        
        getSignature(req.session.userId)
            .then((result) => {
                console.log(result);
                if (result.rowCount > 0) {
                    res.redirect('/confirmation');
                } else {
                    res.render('petition');
                }
            })
            .catch((err) => {
                console.log('err in get petition:', err);
            });
    } else {
        res.redirect("/");
    }
});

app.post("/petition", (req, res) => {
    addSignatures(req.session.userId, req.body.userSignature)
        .then((result) => {
            console.log("result:", result);
            res.redirect("/confirmation");
        })
        .catch((err) => {
            console.log("error in POST petition: ", err);
            res.render("petition", { error: true });
        });
});

app.get("/confirmation", (req, res) => {
    console.log('confirmation req:', req.session);

    getSignature(req.session.userId)
        .then((resultSignature) => {
            getSigners()
                .then((resultSigners) => {
                    res.render("confirmation", {
                        signature: resultSignature.rows[0],
                        signers: resultSigners.rows
                    });
                });
        })
        .catch((err) => {
            console.log("error in GET confirmation: ", err);
            res.redirect("/");
        });
});

app.listen(process.env.PORT || 8080, () => console.log("server listening!"));
