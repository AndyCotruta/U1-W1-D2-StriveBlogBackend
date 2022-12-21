import express, { response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checksBlogPostSchema, triggerBadRequest } from "./validator.js";

const blogsPATHname = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
);

const blogsRouter = express.Router();

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const getBlogs = () => JSON.parse(fs.readFileSync(blogsPATHname));
const writeBlogs = (blogsArray) =>
  fs.writeFileSync(blogsPATHname, JSON.stringify(blogsArray));

// ........................................CRUD operations..................................

// 1. Create blog
blogsRouter.post(
  "/",
  checksBlogPostSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const newBlog = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
      };
      const blogsArray = getBlogs();
      blogsArray.push(newBlog);
      writeBlogs(blogsArray);
      res
        .status(200)
        .send(`Blog with id ${newBlog._id} was created successfully`);
    } catch (error) {
      next(error);
    }
  }
);

// 2. Read all blogs
blogsRouter.get("/", (req, res, next) => {
  try {
    const blogs = getBlogs();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

// 3. Read a blog by ID
blogsRouter.get("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blogsArray = getBlogs();
    const searchedBlog = blogsArray.find((blog) => blog._id === blogId);
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
blogsRouter.put("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blogsArray = getBlogs();
    const oldBlogIndex = blogsArray.findIndex((blog) => blog._id === blogId);
    if (oldBlogIndex !== -1) {
      const oldBlog = blogsArray[oldBlogIndex];
      const updatedBlog = {
        ...oldBlog,
        ...req.body,
        updatedAt: new Date(),
      };
      blogsArray[oldBlogIndex] = updatedBlog;
      writeBlogs(blogsArray);
      res.send(updatedBlog);
    } else {
      next(NotFound(`Blog with id ${blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// 5. Delete a blog
blogsRouter.delete("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blogsArray = getBlogs();
    const filteredBlogsArray = blogsArray.filter((blog) => blog._id !== blogId);
    if (filteredBlogsArray.length !== blogsArray.length) {
      writeBlogs(filteredBlogsArray);
      res.status(204).send();
    } else {
      next(NotFound(`Blog with id ${blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
