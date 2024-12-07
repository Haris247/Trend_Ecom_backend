import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const id = uuidv4();
    const extname = file.originalname.split(".")[1];
    console.log("extname", extname);
    const filename = `${file.originalname}${id}.${extname}`;
    console.log("filename", filename);
    console.log("filename original", file.originalname);
    cb(null, filename);
  },
});

export const singlePhotoUpload = multer({ storage }).single("photo");
