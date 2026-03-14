import mongoose from 'mongoose';
import { UserModel, IUser } from './user.js';
import { OrganizationModel, IOrganization } from './organization.js';

async function runDemo() {
  try {
    // --- 1. CONNECTION ---
    await mongoose.connect('mongodb://127.0.0.1:27017/ea_mongoose');
    console.log('🚀 Connected to MongoDB');

    // --- 2. CLEANING (Idempotency) ---
    // Engineering Rule: Tests/Demos must be repeatable.
    console.log('🧹 Cleaning database...');
    await UserModel.deleteMany({});
    await OrganizationModel.deleteMany({});

    // --- 3. SEEDING (The missing part) ---
    console.log('🌱 Seeding data...');

    // 3.1 Create Organizations first
    const orgs = await OrganizationModel.insertMany([
      { name: 'Initech', country: 'USA' },
      { name: 'Umbrella Corp', country: 'UK' }
    ]);
    
    // We map existing IDs to link them dynamically
    const initechId = orgs[0]._id;
    const umbrellaId = orgs[1]._id;

    // 3.2 Create Users linked to Orgs
    // Manual referencial integrity: We use the actual _id from the created organizations to ensure valid references.
    const usersData = [
      { name: 'Bill', email: 'bill@initech.com', role: 'ADMIN', organization: initechId },
      { name: 'Peter', email: 'peter@initech.com', role: 'USER', organization: initechId },
      { name: 'Alice', email: 'alice@umbrella.com', role: 'EDITOR', organization: umbrellaId }
    ];

    const users = await UserModel.insertMany(usersData);
    console.log(`✅ Seeded ${usersData.length} users and ${orgs.length} organizations`);

    // --- 4.1 DEMO: CRUD OPERATIONS ---
    console.log('\n🔧 CRUD DEMO:');
    // We find the first user by _id
    const user: IUser | null = await UserModel.findById(users[0]._id);
    console.log(`User: ${user?.name}`);
    
    // We find a user by name
    const bill = await UserModel.findOne({ name: 'Bill' });
    console.log(bill);
    
    // Partial<IUser> indicates that the resulting object may have only some of the IUser fields, which is useful when we select only a subset of fields.
    // select() allows us to specify which fields we want to retrieve. 
    // lean() returns a plain JS object instead of a Mongoose Document, which is more lightweight if we don't need the extra methods.
  
    const userPartial: Partial<IUser> | null  = await UserModel.findOne({ name: 'Bill' })
      .select('name email')
      .lean();
    console.log(userPartial);

    // --- 4.2 DEMO: POPULATE (Simulating JOINs) ---
    console.log('\n🔍 POPULATE:');
    
    // We find 'Bill' and ask Mongoose to fetch his Organization details
    const billOrg = await UserModel.findOne({ name: 'Bill' })
      .populate('organization') // The Magic: Replaces ObjectId with the Object
      .lean();

    // TypeScript Trick: We assert the type to tell TS that organization is now populated
    // (In a real app, we would use a specific Interface for populated results)
    const orgDetails = billOrg?.organization as unknown as IOrganization;
    
    console.log(billOrg);
    console.log(`Works at: ${orgDetails?.name} (${orgDetails?.country})`);
    
    // --- 5. DEMO: AGGREGATION PIPELINE ---
    console.log('\n📊 TESTING AGGREGATION:');
    
    const stats = await UserModel.aggregate([
      { $match: { role: { $ne: 'GUEST' } } }, 
      // Group users by Organization ID
      { $group: { 
          _id: '$organization', 
          totalUsers: { $sum: 1 },
      }},
      // Lookup is the Aggregation equivalent of Populate
      { $lookup: {
          from: 'organizations', // Collection name in DB (lowercase/plural)
          localField: '_id',
          foreignField: '_id',
          as: 'orgInfo'
      }},
      // Project to clean the output
      { $project: {
          organizationName: { $arrayElemAt: ['$orgInfo.name', 0] },
          totalUsers: 1
      }}
    ]);

    console.table(stats);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

runDemo();

