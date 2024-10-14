import mongoose from "mongoose";

export async function connectDB (url, dbName) {
    try {
        await mongoose.connect(url + dbName);
        console.log('DB is connected!')
    } catch (error) {
        console.log('DB Error: ', error)
    }
}