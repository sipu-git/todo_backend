import exrpess from 'express'
import multer from 'multer';
import { addUser, loginUser, viewProfile, viewProfileAndUpdate,  } from '../controllers/user.controller'
import { verifyToken } from '../middleware/auth.middleware'

const router = exrpess.Router()
const storage = multer.memoryStorage()
const upload = multer({storage})

router.post('/addUser',upload.single('profile'),addUser)
router.post('/loginUser',loginUser)
router.get('/viewProfile',verifyToken,viewProfile)
router.put("/viewProfileAndUpdate",upload.single('profile'),verifyToken,viewProfileAndUpdate)

export default router;