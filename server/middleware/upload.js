const multer = require('multer');
const path = require('path');

// Configure storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store images in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Rename file
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed'));
};

// Initialize multer
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
    fileFilter
});

module.exports = upload;
