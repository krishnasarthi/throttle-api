const express = require("express");
const app = express();
const apiUsageLog = require('./middleware');

const PORT = 3030;

const dogs = [
  "Labrador retriever",
  "German shepherd",
  "Golden retriever",
  "French bulldog",
  "Bulldog",
  "Beagle",
  "Poodle",
  "Rottweilers",
  "Yorkshire terrier",
  "German shorthaired pointer"
];

const cats = [
  "The oriental",
  "The American shorthair",
  "The Birman",
  "The sphynx",
  "The ragdoll",
  "The Siamese",
  "The Abyssinian",
  "The exotic shorthair",
  "The Maine coon",
  "The Persian"
];

app.use(apiUsageLog);

app.get("/", (req, res) => {
  res.send("<html><body><h1>Welcome to API</h1></body></html>");
});

app.get("/dogs", (req, res) => {
  res.send(dogs);
});

app.get("/cats", (req, res) => {
  res.send(cats);
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
