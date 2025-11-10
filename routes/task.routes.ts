import express from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { addTask, deleteTask, editTask, viewTaskById, viewTasks } from '../controllers/task.controllers';

const router =  express.Router()

router.post('/addTask',verifyToken,addTask)
router.get('/vewTasks',verifyToken,viewTasks)
router.get('/vewTask/:id',verifyToken,viewTaskById)
router.put('/editTask/:id',verifyToken,editTask)
router.delete('/deleteTask/:id',verifyToken,deleteTask)
export default router;