import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  { timestamps: true }
);

authorsSchema.pre("save", async function (next) {
  const currentAuthor = this;
  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;
    const hash = await bcrypt.hash(plainPW, 11);
    currentAuthor.password = hash;
  }
  next();
});

authorsSchema.methods.toJSON = function () {
  const authorDocument = this;
  const author = authorDocument.toObject();

  delete author.password;
  delete author.__v;
  return author;
};

authorsSchema.static("checkCredentials", async function (email, password) {
  const author = await this.findOne({ email });
  console.log("Author:", author);

  if (author) {
    const passwordMatch = await bcrypt.compare(password, author.password);

    if (passwordMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});
export default model("Author", authorsSchema);
