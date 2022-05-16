/* eslint-disable */

import React from 'react'

const EditMarksFooter = () => {
  return (
    <div className="edit-mark-footer">
      <Button className="edit-mark-button edit-mark-confirm" onClick={handleCancelEditMark}>Cancel</Button> 
      <Button className="edit-mark-button edit-mark-cancel" onClick={null}>Save</Button>
    </div>
  )
}

export default EditMarksFooter
