import express from "express";
import fs from "fs";
import AuthorsModel from "./model.js";

import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";

// ..........................................Creating CRUD operations...............................
const authorsRouter = express.Router(); //declaring the Router that connects our operations to the server

// 1. Create
authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 2. Read
authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors); //sending the JSON body
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 3. Read individual author
authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const searchedAuthor = await AuthorsModel.findById(authorId);
    if (searchedAuthor) {
      res.send(searchedAuthor);
    } else {
      next(NotFound(`Author with id ${authorId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 4. Update
authorsRouter.put("/:id", async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      authorId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(NotFound(`Author with id ${authorId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 5.DELETE
authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(authorId);
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(NotFound(`Author with id ${authorId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 6. Create a new author with condition
authorsRouter.post("/checkEmail", async (req, res, next) => {
  const newAuthor = { ...request.body, createdAt: new Date(), id: uniqid() }; //assigning to a new OBJ the values from req body
  const authorsArray = await getAuthors(); //reading and assigning the JSON file according to the pathname
  const existingAuthor = authorsArray.find(
    (author) => author.email === newAuthor.email
  ); //returns or not an OBJ with the corresponding criteria
  existingAuthor
    ? response.send({ isEmailAlreadyInUse: true })
    : response.send({ isEmailAlreadyInUse: false }); //if previously OBJ exists, return true, if not, false
});

export default authorsRouter;
