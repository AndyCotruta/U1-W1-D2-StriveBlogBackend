import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./authors/index.js";
import blogsRouter from "./blogs/index.js";
import {
  genericErrorHandler,
  notFoundHandler,
  badRequestHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import filesRouter from "./files/index.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const server = express();
const port = 3001;
const publicFolderPath = join(process.cwd(), "./public");

server.use(cors());
server.use(express.json());
server.use(express.static(publicFolderPath));

// ..................ENDPOINTS..................
// server.use(
//   express.static(join(dirname(fileURLToPath(import.meta.url)), "../public"))
// );

server.use("/authors", authorsRouter);
server.use("/blogs", blogsRouter);
server.use("", filesRouter);

// ..................ERROR HANDLERS............

server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // 500

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port " + port);
});
