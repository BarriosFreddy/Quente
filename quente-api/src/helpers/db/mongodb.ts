import mongoose, { connect } from 'mongoose';

export async function connectDB(DATABASE_URI: string) {
  // Connect to MongoDB
  mongoose.set('strictQuery', false);
  await connect(DATABASE_URI);
  console.log('Database connected successfully');
}