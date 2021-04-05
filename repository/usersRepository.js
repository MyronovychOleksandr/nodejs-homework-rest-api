const User = require("../schemas/usersSchemas");
class UserRepository {
  constructor() {
    this.Model = User;
  }

  async findUserById(id) {
    return await this.Model.findById(id);
  }

  async findUserByEmail(email) {
    return await this.Model.findOne({ email });
  }

  async findByFild(fild) {
    return await this.Model.findOne(fild);
  }

  async addUser(body) {
    const user = new this.Model(body);
    return user.save();
  }

  async updateToken(id, token) {
    await this.Model.updateOne({ _id: id }, { token });

    return { message: "Not authorized" };
  }

  async updateAvatar(id, avatar, idCloudeAvatar) {
    await this.Model.updateOne(
      { _id: id },
      { avatar, avatarURL: idCloudeAvatar }
    );
  }

  async getAvatar(id) {
    const { avatar, idCloudeAvatar } = await this.Model.findOne({ _id: id });
    return { avatar, idCloudeAvatar };
  }

  async getCurrentUser(id) {
    return await this.Model.findOne(
      { _id: id },
      "_id name email avatarURL subscription"
    );
  }
}

module.exports = UserRepository;
