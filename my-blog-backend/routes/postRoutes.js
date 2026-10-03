const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
const authAdmin = require('../middleware/authMiddleware');

router.get('/', postController.getPosts);
router.post('/', authAdmin, postController.createPost);
router.delete('/:id', authAdmin, postController.deletePost);

module.exports = router;