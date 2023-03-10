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
  forbiddenErrorHandler,
} from "./errorHandlers.js";
import filesRouter from "./files/index.js";
import { join, dirname } from "path";
import mongoose from "mongoose";
import passport from "passport";
import googleStrategy from "./lib/google.js";

const server = express();
const port = process.env.PORT;
const publicFolderPath = join(process.cwd(), "./public");

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("Current origin: " + origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(createHttpError(400, `Origin ${origin} is not allowed`));
    }
  },
};

passport.use("google", googleStrategy);

server.use(cors(corsOpts));
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
server.use(forbiddenErrorHandler); //403
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // 500

mongoose.connect(process.env.MONGODB_URL);

mongoose.connection.on("connected", () => {
  console.log("Connection established to Mongo");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("Server listening on port " + port);
  });
});
