import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";
import { createReadStream, createWriteStream } from "fs";

const { writeFile, readJSON, writeJSON } = fs;

export const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data"
);
export const usersAvatarImagesPath = join(process.cwd(), "./public/usersImgs");
export const coverImagesPath = join(process.cwd(), "./public/blogsCoversImgs");
export const pdfPath = join(dataFolderPath, "test.pdf");

const authorsJSONPath = join(dataFolderPath, "authors.json");
const blogsJSONPath = join(dataFolderPath, "blogs.json");

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (authorsArray) =>
  writeJSON(authorsJSONPath, authorsArray);
export const getBlogs = () => readJSON(blogsJSONPath);
export const writeBlogs = (blogsArray) => writeJSON(blogsJSONPath, blogsArray);

export const saveAuthorsAvatar = (fileName, avatarAsBuffer) =>
  writeFile(join(usersAvatarImagesPath, fileName), avatarAsBuffer);

export const saveBlogCoverImage = (fileName, coverAsBuffer) =>
  writeFile(join(coverImagesPath, fileName), coverAsBuffer);

export const getAuthorsAsReadableStream = () =>
  createReadStream(authorsJSONPath);

export const getPDFWritableStream = (filename) =>
  createWriteStream(join(dataFolderPath, filename));
