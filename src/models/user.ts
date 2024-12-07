import mongoose from "mongoose";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: "male" | "female";
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  dob: Date;
  age: number;
}

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please Enter the ID"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please Enter The Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter The Email"],
      unique: true,
    },
    photo: {
      type: String,
      required: [true, "please Provide Your Photo"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please Choose your Gender"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: [true, "Please Choose your Gender"],
      default: "user",
    },
    dob: {
      type: Date,
      required: [true, "Please Enter Your Date of Birth"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
});

export const User = mongoose.model<IUser>("user", userSchema);
