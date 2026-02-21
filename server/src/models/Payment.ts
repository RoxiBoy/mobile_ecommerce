import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  user: Types.ObjectId;
  order: Types.ObjectId;
  paymentProvider: string;
  transactionId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    paymentProvider: { type: String, required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
