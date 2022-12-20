import express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./blogs/index.js";

const server = express();
const port = 3001;

server.use(express.json());

server.use("/authors", authorsRouter);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port " + port);
});
