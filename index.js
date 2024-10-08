import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let signIn = false;
let userData;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "160606",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function signInProtocol(username, password) {
  try {
    const result = await db.query(
      "Select * FROM webuser WHERE username LIKE $1",
      [username]
    );
    if (
      result.rows[0].username == username &&
      result.rows[0].password == password
    ) {
      signIn = true;
      userData = result.rows[0];
    } else {
      console.log("ERORR");
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs");
  }
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/ribbon", (req, res) => {
  res.render("ribbon.ejs");
});

app.get("/friends", (req, res) => {
  res.render("friends.ejs");
});

app.get("/account", (req, res) => {
  if (signIn) {
    res.render("account.ejs", {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/reg", (req, res) => {
  res.render("registration.ejs");
});

app.get("/signIn", (req, res) => {
  res.render("signIn.ejs");
});

app.post("/reg", async (req, res) => {
  let username = req.body.username.trim();
  let email = req.body.email;
  let password = req.body.password;
  if (username == "" || email == "" || password == "") {
    username = null;
    email = null;
    password = null;
  }
  try {
    await db.query(
      "INSERT INTO webuser (username, password, email) VALUES ($1, $2, $3)",
      [username, password, email]
    );
    signInProtocol(username, password);
    res.redirect("/account");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/signIn", async (req, res) => {
  let username = req.body.username.trim();
  let password = req.body.password;
  if (username == "" || password == "") {
    username = null;
    password = null;
  }
  signInProtocol(username, password);
  res.redirect("/account");
});

app.post("/acc", async (req, res) => {
  userData = [];
  signIn = false;
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
