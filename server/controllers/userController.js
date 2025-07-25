import cloudinary from "../lib/cloudinary.js";
import { generatetoken } from "../lib/utils.js";
import User from "../models/User.js"
import bcrypt from "bcryptjs"


// Signup a new User
export const signup = async (req, res)=> {
    const { fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});

        if(user){
            return res.json({success: false, message: "Account already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generatetoken(newUser._id)

        res.json({success: true, userData: newUser, token, message: "Account Created successfully"})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Controller to login a user 
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        if (!userData) {
            return res.json({success: false, message: "Account does not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid credentials"})
        }

        const token = generatetoken(userData._id)

        res.json({success: true, userData, token, message: "Login successfull"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Controller to check if user is authenticated 
export const checkAuth = (req, res) => {
    res.json({success: true, user: req.user})
}

// Controller to update user profile details 
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body

        const userId = req.user._id;
        let updateduser;

        if(!profilePic){
            updateduser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
        } else{
            const upload = await cloudinary.uploader.upload(profilePic)

            updateduser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }
        res.json({success: true, user: updateduser})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}