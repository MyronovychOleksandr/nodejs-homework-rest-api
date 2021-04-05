const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SALT_FACTOR = 8;
const { Subscription } = require("../helpers/constants");
const { Schema } = mongoose;
const gravatar = require("gravatar");

const userSchema = new Schema({
  name: {
    type: String,
    default: "Guest",
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email mast be requaired"],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: { type: String, required: [true, "Password mast be requaired"] },
  avatarURL: {
    type: String,
    default: function () {
      return gravatar.url(this.email, { s: "250" }, true);
    },
  },
  idCloudeAvatar: {
    type: String,
    default: null,
  },
  subscription: {
    type: String,
    enum: [...Object.values(Subscription)],
    default: "free",
  },
  token: {
    type: String,
    default: null,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(
    this.password,
    bcrypt.genSaltSync(SALT_FACTOR)
  );
  next();
});

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
