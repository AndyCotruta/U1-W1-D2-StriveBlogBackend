import createHttpError from "http-errors";

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.author.role === "Admin") {
    next();
  } else {
    next(
      createHttpError(
        403,
        "You are not an admin. You do not have permission to send a request to this endpoint."
      )
    );
  }
};
