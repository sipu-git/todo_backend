import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import cloudinary from "../configs/upload";
import streamifier from 'streamifier';
import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import UserModel from "../models/user.model";

export const addUser = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const { username, email, phone, age, password, address } = req.body;
        const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneCheck = /^[6-9]\d{9}$/;
        const passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!username || !email || !phone || !age || !address) {
            return res.status(400).json({ message: "All fields are mandatory!" })
        }
        if (!emailCheck.test(email)) {
            return res.status(401).json({ message: "Invaild email address!" })
        }
        if (!phoneCheck.test(phone)) {
            return res.status(401).json({ messaage: "Invalid phone number!" })
        }
        if (!passwordCheck.test(password)) {
            return res.status(401).json({ message: "Invalid password format!" })
        }
        const encryptPswd = await bcrypt.hash(password, 10);
        if (!req.file) {
            console.log("No file received!");
            return res.status(400).json({ message: "Profile image is required!" });
        }
        console.log("Incoming file details:", req.file);
        console.log("☁️ Uploading image to Cloudinary...");

        const uploadImage: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: process.env.CLOUDINARY_FOLDER || 'profile' },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        console.log("Cloudinary upload result:", result);
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
        });

        const findUsers = await UserModel.findOne({ email })
        if (findUsers) {
            return res.status(403).json({ message: "User already exist!" })
        }
        const createUser = await UserModel.create({ username, email, phone, age, password: encryptPswd, address, profileImage: uploadImage.secure_url })
        return res.status(201).json({ message: "User registered successfully!", data: createUser })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "User registration failed!", error })
    }
}


export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password!" });
        }
        user.lastLogin = new Date()
        await user.save()

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.username, profilePic: user.profileImage },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:1000 * 60 * 60 * 24
        })
        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                age: user.age,
                address: user.address,
                profile: user.profileImage,
                lastLogin: user.lastLogin
            },
        });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "token doesn't provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: string };
        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ valid: true, user:{
            id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        age: user.age,
        address: user.address,
        profile: user.profileImage,
        lastLogin: user.lastLogin,
        } });
    } catch (err) {
        console.error(err);
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
}