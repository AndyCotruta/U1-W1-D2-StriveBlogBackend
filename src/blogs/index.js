import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

console.log("IMPORT META URL --> ", import.meta.url); //retrieves current URL of index.js
console.log("PATH --> ", fileURLToPath(import.meta.url)); //converts URL to path
console.log("DIRNAME --> ", dirname(fileURLToPath(import.meta.url))); //we want to get path of parrent directory
const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json" // we are joining 2 strings in order to get the PATH of our JSON file, and we use join method to cover for different OS
);
console.log("TARGET --> ", authorsJSONPath);

// ..........................................Creating CRUD operations...............................
const authorsRouter = express.Router();

// 1. Create
authorsRouter.post("/", (request, response) => {
  const newAuthor = { ...request.body, createdAt: new Date(), id: uniqid() };
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  authorsArray.push(newAuthor);
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
  response.status(200).send({ id: newAuthor.id });
});

// 2. Read
authorsRouter.get("/", (request, response) => {
  const authorsContent = fs.readFileSync(authorsJSONPath); // this is a BUFFER object
  const authors = JSON.parse(authorsContent);
  response.send(authors);
});

// 3. Read individual author
authorsRouter.get("/:id", (request, response) => {
  const authorId = request.params.id;
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  const searchedAuthor = authorsArray.find((author) => author.id === authorId);
  response.send(searchedAuthor);
});

// 4. Update
authorsRouter.put("/:id", (request, response) => {
  const authorId = request.params.id;
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  const oldAuthorIndex = authorsArray.findIndex(
    (author) => author.id === authorId
  );
  const oldAuthor = authorsArray[oldAuthorIndex];
  const updatedAuthor = {
    ...oldAuthor,
    ...request.body,
    updatedAt: new Date(),
  };
  authorsArray[oldAuthorIndex] = updatedAuthor;
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
  response.send(updatedAuthor);
});

// 5.DELETE
authorsRouter.delete("/:id", (request, response) => {
  const authorId = request.params.id;
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  const filteredAuthorsArray = authorsArray.filter(
    (author) => author.id !== authorId
  );
  fs.writeFileSync(authorsJSONPath, JSON.stringify(filteredAuthorsArray));
  response.status(204).send();
});

export default authorsRouter;
