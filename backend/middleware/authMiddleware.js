import jwt from 'jsonwebtoken';
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1] ;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }   
};
export default auth;
