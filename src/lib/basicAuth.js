import createHttpError from "http-errors";
import atob from "atob";
import AuthorModel from "../authors/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide credentials in the Authorization header!"
      )
    );
  } else {
    const encodedCredentials = req.headers.authorization.split(" ")[1];
    const credentials = atob(encodedCredentials);
    console.log(credentials);
    const [email, password] = credentials.split(":");
    console.log("Email:", email, "Password:", password);
    const author = await AuthorModel.checkCredentials(email, password);
    console.log("Author:", author);
    if (author) {
      req.author = author;

      next();
    } else {
      next(createHttpError(401, "Please provide valid credentials!"));
    }
  }
};
