import express from "express";

const app = express();
const port = 3000;

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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});