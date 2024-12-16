import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let signedIn = false;
let userData;
let friendList = [];
let userid;
let findFriend;
let userposts = [];
let allUsersPosts = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "160606",
  port: 5432,
});
db.connect();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

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
      userid = result.rows[0].iduser;
      userData = result.rows[0];
      signedIn = true;
    }
  } catch (err) {
    console.log(err);
    signedIn = false;
  }
}
async function friendListProtocol(iduser) {
  try {
    friendList = [];
    const result = await db.query(
      "Select idfriend FROM friend WHERE iduser = $1",
      [iduser]
    );
    if (result.rows[0] != null) {
      for (let i = 0; i < result.rows.length; i++) {
        const friendResult = await db.query(
          "Select * FROM webuser WHERE iduser = $1",
          [result.rows[i].idfriend]
        );
        friendList[i] = friendResult.rows[0];
      }
    } else {
      friendList[0] = null;
    }
  } catch (err) {
    console.log(err);
  }
}

async function findUserPosts(iduser) {
  try {
    userposts = [];
    const result = await db.query(
      "Select idpost, posttext, post.iduser, title, date, username, avatar FROM post JOIN webuser ON post.iduser= webuser.iduser WHERE post.iduser = $1",
      [iduser]
    );
    if (result.rows[0] != null) {
      userposts = result.rows;
    } else {
      userposts[0] = null;
    }
  } catch (err) {
    console.log(err);
  }
}

async function randomUserPosts() {
  try {
    allUsersPosts = [];
    const result = await db.query(
      "Select idpost, posttext, post.iduser, title, date, username, avatar FROM post JOIN webuser ON post.iduser= webuser.iduser"
    );
    if (result.rows[0] != null) {
      allUsersPosts = result.rows;
      for (let i = allUsersPosts.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [allUsersPosts[i], allUsersPosts[randomIndex]] = [
          allUsersPosts[randomIndex],
          allUsersPosts[i],
        ];
      }
    } else {
      allUsersPosts[0] = null;
    }
  } catch (err) {
    console.log(err);
  }
}

app.get("/", async (req, res) => {
  await randomUserPosts(null);
  res.render("index.ejs", {
    curpage: 1,
    signedIn: signedIn,
  });
});
app.get("/randomPosts", (req, res) => {
  res.render("randomPosts.ejs", { allUsersPosts: allUsersPosts });
});
function DateTime() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate() + 1).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
app.get("/ribbon", async (req, res) => {
  if (signedIn) {
    await findUserPosts(userid);
    res.render("ribbon.ejs", {
      curpage: 2,
      signedIn: signedIn,
      userposts: userposts,
    });
  } else {
    res.redirect("/signIn");
  }
});
app.get("/ribbonFrame", (req, res) => {
  res.render("ribbonFrame.ejs", { userposts: userposts });
});
app.get("/deletePost/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    await db.query("DELETE FROM post WHERE idpost = $1", [postId]);
    res.json({ success: true });
  } catch (error) {
    console.log(err);
    res.json({ success: false });
  }
});
app.get("/createPost", (req, res) => {
  res.render("createPost.ejs", { curpage: 2, signedIn: signedIn });
});
app.get("/friends", async (req, res) => {
  await friendListProtocol(userid);
  if (signedIn) {
    res.render("friends.ejs", {
      friendList: friendList,
      curpage: 3,
      findFriend: findFriend,
      signedIn: signedIn,
    });
  } else {
    res.redirect("/signIn");
  }
});
app.get("/getUserPosts/:id", async (req, res) => {
  await findUserPosts(req.params.id);
  res.render("userPostsFrame.ejs", {
    userposts: userposts,
  });
});
app.get("/account", (req, res) => {
  if (signedIn) {
    res.render("account.ejs", {
      avatar: userData.avatar,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstname,
      lastName: userData.lastname,
      password: userData.password,
      curpage: 4,
      signedIn: signedIn,
    });
  } else {
    res.redirect("/signIn");
  }
});
app.get("/reg", (req, res) => {
  res.render("registration.ejs", { curpage: 6, signedIn: signedIn });
});
app.get("/signIn", (req, res) => {
  res.render("signIn.ejs", { curpage: 5, signedIn: signedIn });
});
app.get("/signOut", async (req, res) => {
  userData = [];
  signedIn = false;
  res.redirect("/");
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

app.post("/update", upload.single("avatar"), async (req, res) => {
  await db.query(
    "UPDATE webuser SET username = $1, password = $2,  email = $3, firstname = $4, lastname = $5, avatar = $6 WHERE username LIKE $1",
    [
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.file.filename,
    ]
  );
  const result = await db.query(
    "Select * FROM webuser WHERE username LIKE $1",
    [req.body.username]
  );
  userData = result.rows[0];
  res.redirect("/account");
});

app.post("/find", async (req, res) => {
  const result = await db.query(
    "Select * FROM webuser WHERE username LIKE $1",
    [req.body.username]
  );
  findFriend = result.rows[0];
  res.redirect("/friends");
});

app.post("/addFriend", async (req, res) => {
  try {
    await db.query("INSERT INTO friend (idfriend, iduser) VALUES ($1, $2)", [
      findFriend.iduser,
      userData.iduser,
    ]);
    await db.query("INSERT INTO friend (idfriend, iduser) VALUES ($1, $2)", [
      userData.iduser,
      findFriend.iduser,
    ]);
    res.redirect("/friends");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/addPost", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO post (posttext, iduser, date, title) VALUES ($1, $2, $3, $4)",
      [req.body.content, userData.iduser, DateTime(), req.body.title]
    );
    res.redirect("/ribbon");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
