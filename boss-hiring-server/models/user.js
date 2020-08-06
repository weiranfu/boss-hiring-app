const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 用户名
  password: { type: String, required: true }, // 密码
  type: { type: String, required: true }, // 用户类型: employer/employee
  avatar: { type: String, default: "" }, // 头像
  post: { type: String, default: "" }, // 职位
  info: { type: String, default: "" }, // 个人或职位简介
  company: { type: String, default: "" }, // 公司名称
  salary: { type: String, default: "" }, // 工资
});

/**
 * Encrypt the password using bcrypt
 */
UserSchema.pre("save", async function () {
  await this.encryptPassword();
});

/**
 * Run Validators for findOneAndUpdate() method
 */
UserSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

UserSchema.pre("findOneAndUpdate", async function () {
  // this in Query Middleware refers to Query not Doc!!!
  const user = await this.model.findOne(this.getQuery()); // this.model refer to User Mode
  const password = this.getUpdate().password;
  console.log(password);
  user.password = password;
  const hashed_password = await user.encryptPassword();
  this.setUpdate({ password: hashed_password });
});

/**
 * Instance Methods of User Model
 */
UserSchema.methods = {
  /**
   * Encrypt password of current user
   * @return {Promise}
   */
  encryptPassword: async function () {
    let user = this;
    // only hash the password if it has been modified or is new
    if (!user.isModified("password")) return;

    try {
      // generate a salt
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR); // hash the password using our new salt
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash; // override the cleartext password with the hashed one
    } catch (err) {
      throw new Error(err);
    }
  },
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Promise}
   */
  authenticate: async function (plainText) {
    let user = this;
    try {
      const isMatch = await bcrypt.compare(plainText, user.password);
      if (!isMatch) return Promise.reject(isMatch);
      return isMatch;
    } catch (err) {
      throw new Error(err);
    }
  },
};

/**
 * Static method of User Model
 */
UserSchema.statics = {
  /**
   * Get an user
   * @param {Object} options
   * @return {Promise}
   */
  load: async function (options) {
    return this.findOne(options.criteria).select(options.select).exec();
  },
  /**
   * List all users
   * @return {Promise}
   */
  list: async function () {
    return (users = await this.find({}));
  },
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
