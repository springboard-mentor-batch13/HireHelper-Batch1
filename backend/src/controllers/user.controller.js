const { User } = require("../models/User");
const { cloudinary } = require("../config/Cloudinary");


const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    res.json(user.toSafeJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const isRemove =
      req.body.remove_profile_picture === "true" ||
      req.body.remove_profile_picture === true;

    
    const updateData = {};

    if (req.body.first_name !== undefined)
      updateData.first_name = req.body.first_name;

    if (req.body.last_name !== undefined)
      updateData.last_name = req.body.last_name;

    if (req.body.email_id !== undefined)
      updateData.email_id = req.body.email_id;

    if (req.body.phone_number !== undefined)
      updateData.phone_number = req.body.phone_number;

    if (req.body.bio !== undefined)
      updateData.bio = req.body.bio;

    
    if (isRemove) {
      console.log("🔥 REMOVING IMAGE (FINAL)");

      updateData.profile_picture = null;
    }

    
    if (req.file) {
      console.log("Uploading new image...");

      const base64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "hirehelper/profile",
      });

      updateData.profile_picture = result.secure_url;
    }

    
    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: updateData },
      { new: true }
    );

    console.log("FINAL DB VALUE:", updatedUser.profile_picture);

    res.json(updatedUser.toSafeJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  getMe,
  updateProfile,
};