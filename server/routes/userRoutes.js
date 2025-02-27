const express = require('express')
const router = express.Router();

const { registerUser, loginUser, findUser, getUsers, updateUser, changePassword, uploadProfileImage, getUserProfile , updateRingtone} = require('../controllers/userController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/find/:userId', findUser)
router.get('/', getUsers)

const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/update', auth, updateUser);
router.post('/change-password', auth, changePassword);
router.post('/upload-image', auth, upload.single('image'), uploadProfileImage);
router.get('/profile', auth, getUserProfile)
router.put('/ringtone', auth, updateRingtone)

module.exports = router