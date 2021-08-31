const express = require('express');
const router = express.Router();

/**
 * Gets the program from its code and all its contained data
 * @param code The code of the program, e.g. 3778
 */
router.get('/getProgram/:code', async (req, res) => {
    const programsCOL = req.app.locals.programsCOL;
    programsCOL.findOne({
        code: req.params.code
    }).then(program => {
        res.json(program);
    }).catch(err => {
        res.status(400).json('Error: ' + err);
    })
})

module.exports = router;