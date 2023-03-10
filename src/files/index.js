import express from "express";
import httpErrors from "http-errors";
import multer from "multer";
import { pipeline } from "stream";
import json2csv from "json2csv";
import { extname, join } from "path";
import {
  getAuthors,
  getAuthorsAsReadableStream,
  getBlogs,
  saveAuthorsAvatar,
  saveBlogCoverImage,
  writeAuthors,
  writeBlogs,
} from "../lib/fs-tools.js";
import { getPDFReadableStream } from "../lib/pdf-tools.js";

const { NotFound, Unauthorized, BadRequest } = httpErrors;
const filesRouter = express.Router();

// 7. Add avatar image
filesRouter.post(
  "/authors/:id/uploadAvatar",
  multer().single("avatar"),
  async (req, res, next) => {
    try {
      const fileExtensionType = extname(req.file.originalname);
      const fileName = req.params.id + fileExtensionType;
      await saveAuthorsAvatar(fileName, req.file.buffer);
      const url = `http://localhost:3001/usersImgs/${fileName}`;
      const authorsArray = await getAuthors();

      const oldAuthorIndex = authorsArray.findIndex(
        (author) => author.id === req.params.id
      );

      if (oldAuthorIndex !== -1) {
        const oldAuthor = authorsArray[oldAuthorIndex];
        const updatedAuthor = {
          ...oldAuthor,
          avatar: url,
          updatedAt: new Date(),
        };
        authorsArray[oldAuthorIndex] = updatedAuthor;
        await writeAuthors(authorsArray);
        res.send("The avatar file has been uploaded");
      } else {
        next(NotFound(`Author with id ${req.params.id} not found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

filesRouter.post(
  "/blogs/:id/uploadCover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      const fileExtensionType = extname(req.file.originalname);
      const fileName = req.params.id + fileExtensionType;
      await saveBlogCoverImage(fileName, req.file.buffer);
      const url = "http://localhost:3001/" + "blogsCoversImgs/" + fileName;
      const blogsArray = await getBlogs();
      const oldBlogIndex = blogsArray.findIndex(
        (blog) => blog._id === req.params.id
      );
      if (oldBlogIndex !== -1) {
        const oldBlog = blogsArray[oldBlogIndex];

        const updatedBlog = {
          ...oldBlog,
          cover: url,
          updatedAt: new Date(),
        };
        blogsArray[oldBlogIndex] = updatedBlog;
        await writeBlogs(blogsArray);
        res.send("Blog cover image saved successfully");
      } else {
        next(NotFound(`Blog with id ${req.params.id} was not found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

filesRouter.get("/blogs/pdf/:blogId", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogpost.pdf");
    const blogId = req.params.blogId;
    const blogsArray = await getBlogs();
    const blogIndex = blogsArray.findIndex((blog) => blog._id === blogId);
    const blog = blogsArray[blogIndex];

    const source = getPDFReadableStream(blog);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log(error);
  }
});

filesRouter.get("/authorsCSV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    const source = getAuthorsAsReadableStream();
    console.log(source);
    const transform = new json2csv.Transform({
      fields: ["firstName", "lastName", "email"],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
