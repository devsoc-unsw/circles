const express = require('express');
const router = express.Router();

/**
 * Gets the specialisation from its code and all its contained data
 * @param code The code of the specialisation, e.g. SENGAH
 */
router.get('/getSpecialisation/:code', async (req, res) => {
    const programsCOL = req.app.locals.specialisationsCOL;
    specialisationsCOL.findOne({
        code: req.params.code
    }).then(specialisation => {
        res.json(specialisation);
    }).catch(err => {
        res.status(400).json('Error: ' + err);
    })
})

module.exports = router;