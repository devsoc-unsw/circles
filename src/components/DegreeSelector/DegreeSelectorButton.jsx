import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Button, Radio } from 'antd';

function DegreeSelectorButton() {
    const onButtonClick=(e)=>{
        console.log('Button clicked')
      }
      
    return (
        <div className="DegreeSelectorButton">
          <Button type="primary" 
            shape="round" 
            size={'large'}
            onClick={onButtonClick}
            >
            Next
          </Button>
        </div>
    )
}

export default DegreeSelectorButton;