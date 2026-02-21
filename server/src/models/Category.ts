import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image?: string;
  parentCategory?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);

