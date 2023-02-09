import GoogleStrategy from "passport-google-oauth20";
import AuthorsModel from "../authors/model.js";
import { createAccessToken } from "./authTools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_URL}/users/googleRedirect`, // this needs to match EXACTLY with the redirect URL you have configured on Google
  },
  async (_, __, profile, passportNext) => {
    // This function is executed when Google sends us a successfull response
    // Here we are going to receive some informations about the user from Google (scopes --> profile, email)
    try {
      const { email, given_name, family_name } = profile._json;

      // 1. Check if the user is already in db
      const author = await AuthorsModel.findOne({ email });

      if (author) {
        // 2. If he is there --> generate an accessToken (optionally a refresh token)
        const accessToken = await createAccessToken({
          _id: author._id,
          role: author.role,
        });

        // 2.1 Then we can go next (to /googleRedirect route handler function), passing the token
        passportNext(null, { accessToken });
      } else {
        // 3. If the author is not in our db --> create that
        const newAuthor = new AuthorsModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleId: profile.id,
        });
        const createdAuthor = await newAuthor.save();

        // 3.1 Then generate an accessToken (optionally a refresh token)
        const accessToken = await createAccessToken({
          _id: createdAuthor._id,
          role: createdAuthor.role,
        });

        // 3.2 Then we can go next (to /googleRedirect route handler function), passing the token
        passportNext(null, { accessToken });
      }
    } catch (error) {
      console.log(error);
      // 4. In case of errors we are going to catch'em
      passportNext(error);
    }
  }
);

export default googleStrategy;
