import { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  organization: Types.ObjectId; // Referència forta a l'altra col·lecció
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ADMIN', 'EDITOR', 'USER'], default: 'USER' },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

export const UserModel = model<IUser>('User', userSchema);