import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  selectedVariant?: string;
  priceAtTime: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    selectedVariant: { type: String },
    priceAtTime: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [CartItemSchema],
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
