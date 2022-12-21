import express, { response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { request } from "http";

const blogsPATHname = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
);

const blogsRouter = express.Router();

const getBlogs = () => JSON.parse(fs.readFileSync(blogsPATHname));
const writeBlogs = (blogsArray) =>
  fs.writeFileSync(blogsPATHname, JSON.stringify(blogsArray));

// ........................................CRUD operations..................................

// 1. Create blog
blogsRouter.post("/", (req, res) => {
  const newBlog = {
    ...req.body,
    _id: uniqid(),
    createdAt: new Date(),
  };
  const blogsArray = getBlogs();
  blogsArray.push(newBlog);
  writeBlogs(blogsArray);
  res.status(200).send(`Blog with id ${newBlog._id} was created successfully`);
});

// 2. Read all blogs
blogsRouter.get("/", (req, res) => {
  const blogs = getBlogs();
  res.send(blogs);
});

// 3. Read a blog by ID
blogsRouter.get("/:blogId", (req, res) => {
  const blogId = req.params.blogId;
  const blogsArray = getBlogs();
  const searchedBlog = blogsArray.find((blog) => blog._id === blogId);
  res.send(searchedBlog);
});

// 4. Update a blog
blogsRouter.put("/:blogId", (req, res) => {
  const blogId = req.params.blogId;
  const blogsArray = getBlogs();
  const oldBlogIndex = blogsArray.findIndex((blog) => blog._id === blogId);
  const oldBlog = blogsArray[oldBlogIndex];
  const updatedBlog = {
    ...oldBlog,
    ...req.body,
    updatedAt: new Date(),
  };
  blogsArray[oldBlogIndex] = updatedBlog;
  writeBlogs(blogsArray);
  res.send(updatedBlog);
});

// 5. Delete a blog
blogsRouter.delete("/:blogId", (req, res) => {
  const blogId = req.params.blogId;
  const blogsArray = getBlogs();
  const filteredBlogsArray = blogsArray.filter((blog) => blog._id !== blogId);
  res.status(204).send();
});

export default blogsRouter;
