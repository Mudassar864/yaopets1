import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Upload a file to Cloudinary
export const uploadFile = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    
    // Return the Cloudinary URL
    res.status(200).json({ 
      url: req.file.path,
      mediaUrl: req.file.path
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload multiple files to Cloudinary
export const uploadFiles = async (req, res) => {
  try {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }
    
    // Return the Cloudinary URLs
    const urls = req.files.map(file => file.path);
    
    res.status(200).json({ 
      urls,
      mediaUrls: urls
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Convert blob URL to permanent storage
export const convertBlobToStorage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    
    // Return the Cloudinary URL
    res.status(200).json({ 
      url: req.file.path,
      mediaUrl: req.file.path
    });
  } catch (error) {
    console.error('Convert blob error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Serve a local file (for development only)
export const serveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (filename.endsWith('.mp4')) {
      contentType = 'video/mp4';
    }
    
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};