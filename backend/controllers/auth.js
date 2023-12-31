const User = require("../models/Users");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const signup = async (req, res, next) => {

    const { username, email, password } = req.body;

    let userEmail = await User.findOne({ email });

    if (userEmail) {
        res.status(400).json({ success: false, message: "Email Already exists ." })
    } else if (await User.findOne({ username })) {
        res.status(400).json({ success: false, message: "Username Already exists ." })
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    try {

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(200).json({ success: true, message: "Account created Successfully." });

    } catch (error) {

        next(error);

    }

}

const signin = async (req, res, next) => { 

    const { email, password } = req.body;
    try {

        const validUser = await User.findOne({ email });
        if (!validUser) {
            res.status(404).json({ success: false, message: "User not found." })
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            res.status(400).json({ success: false, message: "Invalid Credentials." })
        }
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const { password: hashedPassword, ...rest } = validUser._doc;
        const expiryDate = new Date(Number(new Date()) + 1 * 24 * 60 * 60 * 1000);
        res.cookie("access_token", token, { httpOnly: true, expires: expiryDate, sameSite: 'None', secure: true, })
        
        res.status(200).json({ success: true, message: "Logged in Successfully.", user: rest, token: token });
        
    } catch (error) {

        next(error);
        
    }
 }

const google = async (req, res, next) => { 

    try {

        const user = await User.findOne({ email: req.body.email });
        if(user){
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: hashedPassword, ...rest } = user._doc;
            const expiryDate = new Date(Number(new Date()) + 1 * 24 * 60 * 60 * 1000);
            res.cookie("access_token", token, { httpOnly: true, expires: expiryDate })
            
            res.status(200).json({ success: true, message: "Logged in Successfully.", user: rest, token: token });
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8) , email: req.body.email, password: hashedPassword, profilePicture: req.body.photo });

            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: hashedPassword2 , ...rest } = newUser._doc;
            const expiryDate = new Date(Number(new Date()) + 1 * 24 * 60 * 60 * 1000);
            res.cookie("access_token", token, { httpOnly: true, expires: expiryDate })
            res.status(200).json({ success: true, message: "Logged in Successfully.", user: rest, token: token });
        }
        
    } catch (error) {
        next(error);
    }

 }

module.exports = { signup, signin, google };