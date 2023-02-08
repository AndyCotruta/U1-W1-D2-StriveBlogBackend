import express, { response } from "express";
import fs from "fs";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checksBlogPostSchema, triggerBadRequest } from "./validator.js";
import { getAuthors, getBlogs, pdfPath, writeBlogs } from "../lib/fs-tools.js";
import { sendRegistrationEmail } from "../lib/email-tools.js";
import { asyncPDFGeneration } from "../lib/pdf-tools.js";
import BlogsModel from "./model.js";
import { request } from "http";
import q2m from "query-to-mongo";
import { basicAuthMiddleware } from "../lib/basicAuth.js";
import { adminOnlyMiddleware } from "../lib/adminOnly.js";

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
blogsRouter.post("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new BlogsModel({
      ...req.body,
      authors: [req.author._id, ...req.body.authors],
    });
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
blogsRouter.get(
  "/",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const { total, books } = await BlogsModel.findBlogsWithAuthors(
        mongoQuery
      );
      const blogs = await BlogsModel.find();
      res.send({
        links: mongoQuery.links("http://localhost:3001/blogs", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        blogs,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 3. Read a blog by ID
blogsRouter.get(
  "/:blogId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const blogId = req.params.blogId;
      const searchedBlog = await BlogsModel.findById(blogId).populate({
        path: "authors",
        select: "firstName lastName email",
      });
      if (searchedBlog) {
        res.send(searchedBlog);
      } else {
        next(NotFound(`Blog with id ${blogId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

// 4. Update a blog
blogsRouter.put(
  "/:blogId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

// 5. Delete a blog
blogsRouter.delete(
  "/:blogId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

// 6. Add blog comments
blogsRouter.post(
  "/:id/comments",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const newComment = { ...req.body, timestamps: true };
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true, runValidators: true }
      );
      if (updatedBlog) {
        res.send(updatedBlog);
      } else {
        next(NotFound(`Blog with id ${id} not found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// 7. Get all comments for a blog
blogsRouter.get(
  "/:id/comments",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const blog = await BlogsModel.findById(id);
      if (blog) {
        res.send(blog.comments);
      } else {
        next(NotFound(`Blog with id ${id} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 8. Get comment by id

blogsRouter.get(
  "/:id/comments/:commentId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const blogId = req.params.id;
      const commentId = req.params.commentId;
      const blog = await BlogsModel.findById(blogId);
      if (blog) {
        const comment = blog.comments.find(
          (comment) => comment._id.toString() === commentId
        );
        if (comment) {
          res.send(comment);
        } else {
          next(NotFound(`Comment with id ${commentId} not found`));
        }
      } else {
        next(NotFound(`Blog with id ${blogId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 9. Update comment by ID

blogsRouter.put(
  "/:id/comments/:commentId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const blogId = req.params.id;
      const commentId = req.params.commentId;
      const blog = await BlogsModel.findById(blogId);
      if (blog) {
        const index = blog.comments.findIndex(
          (comment) => comment._id.toString() === commentId
        );
        if (index !== -1) {
          blog.comments[index] = {
            ...blog.comments[index].toObject(),
            ...req.body,
          };
          await blog.save();
          res.send(blog);
        } else {
          next(NotFound(`Comment with id ${commentId} not found`));
        }
      } else {
        next(NotFound(`Blog with id ${blogId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 10. Delete comment by ID
blogsRouter.delete(
  "/:id/comments/:commentId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const blogId = req.params.id;
      const commentId = req.params.commentId;
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        blogId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
      if (updatedBlog) {
        res.send(updatedBlog);
      } else {
        next(NotFound(`Blog with id ${blogId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default blogsRouter;
