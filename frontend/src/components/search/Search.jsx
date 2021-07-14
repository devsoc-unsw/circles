import React from 'react';
import { Select } from 'antd'
import './search.less'

const { Option } = Select;
export const Search = ({ 
    data,
    onSearch=null,
    onChange=null,
    showSearch=false,
    placeholder='',
    style={}
}) => {
    return (
        <Select 
            className={'search'}
            showSearch={showSearch}
            style={style}
            placeholder={placeholder}
            onSearch={onSearch}
            onChange={onChange}
            filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            { data.map(l => <Option className='text option' value={l}>{l}</Option>) }
        </Select>
    )
}