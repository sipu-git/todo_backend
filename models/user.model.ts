import mongoose, { Document, Model, Schema } from "mongoose";

export interface User extends Document{
    username:string,
    email:string,
    phone:string,
    age:number,
    password:string,
    address?:string,
    profileImage:string,
    lastLogin?:Date,
}

const createSchema :Schema<User> = new Schema({
  username:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },
  phone:{
    type:String,
    trim:true,
    required:true,
  },
  age:{
    type:Number,
    required:true,
    trim:true
  },
  password:{
    type:String,
    required:true,
  },
  address:{
    type:String,
    requried:false
  },
  profileImage:{
    type:String,
    required:true
  },
  lastLogin:{
    type:Date,
    default:Date.now,
  }
},{timestamps:true})


const UserModel:Model<User> = mongoose.model<User>('UserModel',createSchema)
export default UserModel;
