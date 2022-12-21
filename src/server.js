import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./authors/index.js";
import blogsRouter from "./blogs/index.js";

const server = express();
const port = 3001;

server.use(cors());
server.use(express.json());

server.use("/authors", authorsRouter);
server.use("/blogs", blogsRouter);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port " + port);
});
