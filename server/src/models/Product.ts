import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVariant {
  size?: string;
  color?: string;
  stock: number;
}

export interface IReview {
  user: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: Types.ObjectId;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  variants: IVariant[];
  reviews: IReview[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    size: { type: String },
    color: { type: String },
    stock: { type: Number, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String },
    stock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    variants: [VariantSchema],
    reviews: [ReviewSchema],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
