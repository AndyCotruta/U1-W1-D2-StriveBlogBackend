import express from "express";
import fs from "fs";
import AuthorsModel from "./model.js";
import BlogsModel from "../blogs/model.js";

import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";
import { basicAuthMiddleware } from "../lib/basicAuth.js";
import { adminOnlyMiddleware } from "../lib/adminOnly.js";

// ..........................................Creating CRUD operations...............................
const authorsRouter = express.Router(); //declaring the Router that connects our operations to the server

// /me ENDPOINTS................................................................

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/me/stories",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const allBlogs = await BlogsModel.find();

      const myBlogs = allBlogs.filter((blog) =>
        blog.authors.includes(req.author._id)
      );
      res.send(myBlogs);
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    await AuthorsModel.findByIdAndUpdate(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 1. Create
authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send(`Author with ID ${_id} was created successfully`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 2. Read
authorsRouter.get(
  "/",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authors = await AuthorsModel.find({});
      res.send(authors); //sending the JSON body
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 3. Read individual author
authorsRouter.get(
  "/:id",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

// 4. Update
authorsRouter.put(
  "/:id",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

// 5.DELETE
authorsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

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
