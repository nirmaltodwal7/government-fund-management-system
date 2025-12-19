import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const register = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    address, 
    aadharNumber, 
    ppoNumber,
    phoneNumber, 
    dateOfBirth, 
    gender 
  } = req.body;
  
  try {
    // Check if user already exists with email, Aadhar number, or P.P.O number
    let user = await User.findOne({ 
      $or: [{ email }, { aadharNumber }, { ppoNumber }] 
    });
    
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (user.aadharNumber === aadharNumber) {
        return res.status(400).json({ message: "User with this Aadhar number already exists" });
      }
      if (user.ppoNumber === ppoNumber) {
        return res.status(400).json({ message: "User with this P.P.O number already exists" });
      }
    }
    
    // Validate required fields (ppoNumber is now optional)
    if (!name || !email || !password || !address || !aadharNumber || !phoneNumber || !dateOfBirth || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate address object
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ message: "Complete address information is required" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userData = {
      name,
      email,
      password: hashedPassword,
      address,
      aadharNumber,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender
    };
    
    // Only add ppoNumber if it's provided
    if (ppoNumber) {
      userData.ppoNumber = ppoNumber;
    }
    
    user = new User(userData);
    
    await user.save();
    
    const payload = {
      user: {
        id: user._id,
      },
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",  
    });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        faceEnrolled: user.faceEnrolled,
        faceEnrollmentDate: user.faceEnrollmentDate
      }
    });
    } catch (error) {  
        res.status(500).json({ message: "Server error" }); 
    }
};
export const logout = (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: "Logged out successfully. Please remove the token on the client side " });
};
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        aadharNumber: user.aadharNumber,
        ppoNumber: user.ppoNumber,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const viewusers = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addEnrolledScheme = async (req, res) => {
  try {
    console.log('Add enrolled scheme request received:', req.body);
    console.log('User ID from token:', req.user?.id);
    
    const userId = req.user.id;
    const { schemeName, schemeId, userUniqueSchemeNumber } = req.body;
    
    // Validate required fields
    if (!schemeName || !schemeId || !userUniqueSchemeNumber) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "All scheme fields are required" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('User found:', user.name);
    console.log('Current enrolled schemes:', user.enrolledSchemes);
    
    // Check if scheme already exists for this user
    const existingScheme = user.enrolledSchemes.find(
      scheme => scheme.schemeId === schemeId || scheme.userUniqueSchemeNumber === userUniqueSchemeNumber
    );
    
    if (existingScheme) {
      console.log('Scheme already exists');
      return res.status(400).json({ message: "Scheme already enrolled or scheme number already exists" });
    }
    
    // Add new scheme
    const newScheme = {
      schemeName,
      schemeId,
      userUniqueSchemeNumber,
      enrollmentDate: new Date(),
      status: 'Active'
    };
    
    console.log('Adding new scheme:', newScheme);
    
    user.enrolledSchemes.push(newScheme);
    
    // Use updateOne to only update the enrolledSchemes field without triggering full validation
    await User.updateOne(
      { _id: userId },
      { $push: { enrolledSchemes: newScheme } }
    );
    
    console.log('Scheme saved successfully. Updated schemes:', user.enrolledSchemes);
    
    res.status(201).json({
      success: true,
      message: "Scheme enrolled successfully",
      scheme: newScheme
    });
  } catch (error) {
    console.error('Error in addEnrolledScheme:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEnrolledSchemes = async (req, res) => {
  try {
    console.log('Get enrolled schemes request received');
    console.log('User ID from token:', req.user?.id);
    
    const userId = req.user.id;
    const user = await User.findById(userId).select('enrolledSchemes');
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('User found:', user.name);
    console.log('Enrolled schemes:', user.enrolledSchemes);
    
    res.status(200).json({
      success: true,
      schemes: user.enrolledSchemes
    });
  } catch (error) {
    console.error('Error in getEnrolledSchemes:', error);
    res.status(500).json({ message: "Server error" });
  }
};

