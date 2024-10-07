CREATE TABLE webUser (
  username VARCHAR(45) NOT NULL PRIMARY KEY ,
  password VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  avatar TEXT,
  firstName VARCHAR(45),
  lastName VARCHAR(45),
  postCount INT,
  birthDate DATE
 );
  
CREATE TABLE post (
  idpost SERIAL NOT NULL PRIMARY KEY,
  postText TEXT,
  webUser_username VARCHAR(45),
  FOREIGN KEY (webUser_username) REFERENCES webUser(username)
);
	
CREATE TABLE friend (
  id_friend SERIAL NOT NULL PRIMARY KEY,
  nickname VARCHAR(45) NOT NULL,
  firstName VARCHAR(45),
  lastName VARCHAR(45),
  birthDate DATE,
  webUser_username VARCHAR(45),
  FOREIGN KEY (webUser_username) REFERENCES webUser(username)
);