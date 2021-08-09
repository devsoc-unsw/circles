import React from 'react';
import ParticleBackground from './ParticleBackground';
import SelectorMenu from './SelectorMenu';
import { useSelector } from 'react-redux';
import './main.less';

function DegreeSelector() {
    const theme = useSelector(store => store.theme);
    return (
        <div>
            <SelectorMenu />
            { theme === 'dark' && <ParticleBackground />}
        </div>
    );
}

export default DegreeSelector;