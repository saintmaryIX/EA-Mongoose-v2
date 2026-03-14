import mongoose from 'mongoose';
import { Types } from 'mongoose';

import { OrganizationModel } from './models/organization.js';
import {
  create,
  getById,
  update,
  remove,
  listAll
} from './services/locationService.js';

async function main() {

  await mongoose.connect('mongodb://127.0.0.1:27017/ea_mongoose');

  console.log("Connected to MongoDB");

  // limpiar db
  await OrganizationModel.deleteMany({});

  const org = await OrganizationModel.create({
    name: "HP Technology",
    country: "USA"
  });
  

  // CREATE
  const location = await create({
    name: "Main Office",
    city: "Barcelona",
    capacity: 500,
    organization: new Types.ObjectId(org._id)
  });

  console.log("\nCREATED LOCATION");
  console.log(location);

  // GET BY ID
  const loc = await getById(location._id!.toString());

  console.log("\nGET BY ID (POPULATE)");
  console.log(loc);

  // UPDATE
  const updated = await update(location._id!.toString(), {
    capacity: 800
  });

  console.log("\nUPDATED");
  console.log(updated);

  // LIST ALL
  const all = await listAll();

  console.log("\nALL LOCATIONS");
  console.log(all);

  // DELETE
  await remove(location._id!.toString());

  console.log("\nDELETED");

  const afterDelete = await listAll();

  console.log("\nAFTER DELETE");
  console.log(afterDelete);

  await mongoose.disconnect();
}

main();