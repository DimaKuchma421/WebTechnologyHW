import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

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
  res.render("account.ejs");
});
app.get("/reg", (req, res) => {
  res.render("registration.ejs");
});
app.get("/signIn", (req, res) => {
  res.render("signIn.ejs");
});

app.post("/reg", (req, res) => {
  let username = req.body.username.trim();
  let email = req.body.email;
  let password = req.body.password;
  if (username == "" || email == "" || password == "") {
    username = null;
    email = null;
    password = null;
  }

  res.render("account.ejs");
});

app.post("/signIn", (req, res) => {
  let username = req.body.username.trim();
  let password = req.body.password;
  if (username == "" || password == "") {
    username = null;
    password = null;
  }
  
  res.render("account.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});