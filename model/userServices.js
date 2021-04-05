const UserRepository = require("../repository/usersRepository");
const EmailServise = require("./email.js");
const { ErrorHandler } = require("../helpers/ErrorHandler");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
class UserService {
  constructor() {
    this.cloudinary = cloudinary;
    this.cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.ClOUD_API_SECRET,
    });
    this.emailServise = new EmailServise();
    this.repositories = { users: new UserRepository() };
  }

  async create(body) {
    const verifyToken = uuidv4();
    const { email, name } = body;

    try {
      await this.emailServise.sendEmail(verifyToken, email, name);
    } catch (e) {
      console.log(`e`, e.response.body);
      throw new ErrorHandler(503, e.message, "Servise unavailable");
    }

    const data = await this.repositories.users.addUser({
      ...body,
      verifyToken,
    });

    return data;
  }

  async findByEmail(email) {
    const data = await this.repositories.users.findUserByEmail(email);
    return data;
  }

  async findById(id) {
    const data = await this.repositories.users.findUserById(id);
    return data;
  }

  async updateAvatar(id, pathFile) {
    try {
      const {
        secure_url: avatar,
        public_id: idCloudeAvatar,
      } = await this.#uploadCloud(pathFile);
      const oldAvatar = await this.repositories.users.getAvatar(id);
      this.cloudinary.uploader.destroy(
        oldAvatar.idCloudeAvatar,
        (err, result) => {
          console.log(err, result);
        }
      );
      await this.repositories.users.updateAvatar(id, avatar, idCloudeAvatar);
      await fs.unlink(pathFile);
      return avatar;
    } catch (err) {
      throw new ErrorHandler(null, "Error upload avatar");
    }
  }

  async getCurrentUser(id) {
    const data = await this.repositories.users.getCurrentUser(id);
    return data;
  }

  async verify({ token }) {
    const user = await this.repositories.users.findByFild({
      verifyToken: token,
    });
    if (user) {
      await user.updateOne({ verify: true, verifyToken: null });
      return true;
    }
    return false;
  }

  #uploadCloud = (pathFile) => {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload(
        pathFile,
        {
          folder: "Avatars",
          transformation: {
            width: 250,

            crop: "fill",
          },
        },
        (error, result) => {
          if (error) reject(error);
          if (result) resolve(result);
        }
      );
    });
  };
}

module.exports = UserService;
