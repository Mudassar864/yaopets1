import express from 'express';
import { 
  uploadFile,
  uploadFiles,
  convertBlobToStorage,
  serveFile
} from '../controllers/uploadController.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload a single file (requires auth)
router.post('/file', auth, upload.single('file'), uploadFile);

// Upload multiple files (requires auth)
router.post('/files', auth, upload.array('files', 10), uploadFiles);

// Convert blob to permanent storage (requires auth)
router.post('/blob', auth, upload.single('file'), convertBlobToStorage);

// Serve a local file (for development only)
router.get('/file/:filename', serveFile);

export default router;