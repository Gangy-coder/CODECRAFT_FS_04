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

        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

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

        const isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid credentials"})
        }

        const token = generatetoken(newUser._id)

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