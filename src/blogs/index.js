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
const authorsRouter = express.Router(); //declaring the Router that connects our operations to the server

// 1. Create
authorsRouter.post("/", (request, response) => {
  const newAuthor = { ...request.body, createdAt: new Date(), id: uniqid() }; //new author is contained by the spreaded req body, and also serverGenerated values
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath)); //reading and assigning the JSON file according to the pathname
  authorsArray.push(newAuthor); //pushing the newAuthor to the previously declared array
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray)); //writing to the pathname the JSON Array
  response.status(200).send({ id: newAuthor.id }); //sending back the response
});

// 2. Read
authorsRouter.get("/", (request, response) => {
  const authorsContent = fs.readFileSync(authorsJSONPath); // this is a BUFFER object
  const authors = JSON.parse(authorsContent); //we need to parse it in order to read it in a "pretty" way
  response.send(authors); //sending the JSON body
});

// 3. Read individual author
authorsRouter.get("/:id", (request, response) => {
  const authorId = request.params.id; //reading params from the URL
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath)); //reading and assigning the JSON file according to the pathname
  const searchedAuthor = authorsArray.find((author) => author.id === authorId); //retrieves the OBJ of the array that corresponds to the criteria
  response.send(searchedAuthor); //sends back the response
});

// 4. Update
authorsRouter.put("/:id", (request, response) => {
  const authorId = request.params.id; //reading params from the URL
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath)); //reading and assigning the JSON file according to the pathname
  const oldAuthorIndex = authorsArray.findIndex(
    (author) => author.id === authorId
  ); //retrieves the index corresponding to the user's passed ID
  const oldAuthor = authorsArray[oldAuthorIndex]; //assigning the correct old author based on the previously found index
  const updatedAuthor = {
    ...oldAuthor,
    ...request.body,
    updatedAt: new Date(),
  }; //updating the old OBJ body with the req body, adding server generated values
  authorsArray[oldAuthorIndex] = updatedAuthor; //updating the array at correct index with the new OBJ
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray)); //writing the new JSON file with the updated Array
  response.send(updatedAuthor); //sends back the updated version of the oldAuthor
});

// 5.DELETE
authorsRouter.delete("/:id", (request, response) => {
  const authorId = request.params.id; //reading params from the URL
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath)); //reading and assigning the JSON file according to the pathname
  const filteredAuthorsArray = authorsArray.filter(
    (author) => author.id !== authorId
  ); //returns a new array of authors just with authors that don't have the id equal to the passed authorId (aka deletes the corresponding author)
  fs.writeFileSync(authorsJSONPath, JSON.stringify(filteredAuthorsArray)); //writing the new JSON file with the new filtered Array
  response.status(204).send(); //response just with status
});

// 6. Create a new author with condition
authorsRouter.post("/checkEmail", (request, response) => {
  const newAuthor = { ...request.body, createdAt: new Date(), id: uniqid() }; //assigning to a new OBJ the values from req body
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath)); //reading and assigning the JSON file according to the pathname
  const existingAuthor = authorsArray.find(
    (author) => author.email === newAuthor.email
  ); //returns or not an OBJ with the corresponding criteria
  existingAuthor
    ? response.send({ isEmailAlreadyInUse: true })
    : response.send({ isEmailAlreadyInUse: false }); //if previously OBJ exists, return true, if not, false
});

export default authorsRouter;
