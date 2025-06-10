import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yaopets',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp'],
    resource_type: 'auto',
    transformation: [
      { width: 1200, crop: 'limit' }, // Resize images to max width 1200px
    ],
  },
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif|mp4|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('File upload only supports the following filetypes: ' + filetypes));
  },
});

export default upload;