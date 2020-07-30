const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUser, dbPass } = require("./secrets");
    db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);
}

exports.addUsers = (first_name, last_name, email, user_password) => {
    return db.query(
        `INSERT INTO users (first_name, last_name, email, user_password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, email, user_password]
    );
};

exports.getUser = (email) => {
    return db.query(
        `SELECT id, user_password FROM users WHERE email = $1`,
        [email]
    );
};

exports.addSignatures = (user_id, user_signature) => {
    return db.query(
        `INSERT INTO signatures (user_id, user_signature) VALUES ($1, $2) RETURNING id `,
        [user_id, user_signature]
    );
};

exports.getSignature = (user_id) => {
    return db.query(
        `SELECT user_signature FROM signatures WHERE user_id = $1`,
        [user_id]
    );
};

exports.getSigners = () => {
    return db.query(
        `SELECT first_name, last_name
        FROM users 
        JOIN signatures 
        ON users.id = signatures.user_id
        `
    );
};

