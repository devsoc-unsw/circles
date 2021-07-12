const express = require('express');
const router = express.Router();

/**
 * Gets the course from its code and all its contained data
 * @param code The code of the course, e.g. COMP1511
 */
router.get('/getCourse/:code', async (req, res) => {
    const coursesCOL = req.app.locals.coursesCOL;
    coursesCOL.findOne({
        code: req.params.code
    }).then(course => {
        res.json(course);
    }).catch(err => {
        res.status(400).json('Error: ' + err);
    })
})

module.exports = router;