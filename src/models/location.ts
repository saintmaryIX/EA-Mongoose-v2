import { Schema, model, Types } from 'mongoose';

export interface ILocation {
  _id?: string;
  name: string;
  city: string;
  capacity: number;
  organization: Types.ObjectId;
}

const locationSchema = new Schema<ILocation>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
});

export const LocationModel = model<ILocation>('Location', locationSchema);
