import express, { response } from "express";
import fs from "fs";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checksBlogPostSchema, triggerBadRequest } from "./validator.js";
import { getAuthors, getBlogs, pdfPath, writeBlogs } from "../lib/fs-tools.js";
import { sendRegistrationEmail } from "../lib/email-tools.js";
import { asyncPDFGeneration } from "../lib/pdf-tools.js";
import BlogsModel from "./model.js";

const blogsRouter = express.Router();

const { NotFound, Unauthorized, BadRequest } = httpErrors;

// ........................................CRUD operations..................................

async function getBlogPostsWithAuthors() {
  const blogPostsArray = await getBlogs();
  const authors = await getAuthors();
  const blogPostsWithAuthors = blogPostsArray.map((blogPost) => {
    const targetAuthor = authors.find((a) => a.id === blogPost.author);
    if (targetAuthor) {
      blogPost.author = targetAuthor;
    }
    return blogPost;
  });
  return blogPostsWithAuthors;
}

// 1. Create blog
blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    const { email } = req.body;
    const blog = req.body;

    await asyncPDFGeneration(blog);

    fs.readFile(pdfPath, async (err, data) => {
      await sendRegistrationEmail(data, email);
    });

    res.status(200).send(`Blog with id ${_id} was created successfully`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 2. Read all blogs
blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find();
    res.send(blogs);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 3. Read a blog by ID
blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const searchedBlog = await BlogsModel.findById(blogId);
    if (searchedBlog) {
      res.send(searchedBlog);
    } else {
      next(NotFound(`Blog with id ${blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// 4. Update a blog
blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const updatedUser = await BlogsModel.findByIdAndUpdate(blogId, req.body, {
      new: true,
      runValidators: true,
    });
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(NotFound(`Blog with id ${blogId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 5. Delete a blog
blogsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const deletedUser = await BlogsModel.findByIdAndDelete(blogId);
    if (deletedUser) {
      res.status(204).send(`Blog with id ${blogId} was deleted succesfully`);
    } else {
      next(NotFound(`Blog with id ${blogId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 6. Add blog comments
blogsRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const id = req.params.id;
    const blogsArray = await getBlogs();
    console.log(req.body.comment);
    res.send("We have received the comment");
  } catch (error) {
    console.log(error);
  }
});

export default blogsRouter;
