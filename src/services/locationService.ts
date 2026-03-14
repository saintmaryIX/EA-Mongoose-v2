import { Types } from 'mongoose';
import { LocationModel, type ILocation } from '../models/location.js';

export async function create(data: Omit<ILocation, '_id'>) {
  return await LocationModel.create(data);
}

export async function getById(id: string) {
  return await LocationModel
    .findById(new Types.ObjectId(id))
    .populate('organization')
    .lean();
}

export async function update(id: string, data: Partial<Omit<ILocation, '_id'>>) {
  return await LocationModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    data,
    { new: true, runValidators: true }
  ).lean();
}

export async function remove(id: string) {
  return await LocationModel.findByIdAndDelete(
    new Types.ObjectId(id)
  ).lean();
}

export async function listAll() {
  return await LocationModel.find().lean();
}
