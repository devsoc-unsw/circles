import { IoMdMoon, IoIosSunny } from "react-icons/io";
import React from "react";
import {
    Menu,
    Divider,
} from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router";
import { toggleTheme } from "../../actions/toggleTheme";



export const DrawerContent = ({ onCloseDrawer }) => {
    const theme = useSelector(state => state.theme);
    const history = useHistory();
    const dispatch = useDispatch();
    const handlePush = (url) => {
        history.push(url);
        onCloseDrawer();
    } 
    const handleThemeToggle = () => {
        console.log('is this run?')
        dispatch(toggleTheme(theme === "light" ? "dark" : "light"));
        onCloseDrawer();
    }
    return (
        <Menu mode="vertical" style={{ width: 230 }}>
            <Menu.Item key="1" 
                onClick={() => handlePush('/course-selector')}
            >
                Course Selector
            </Menu.Item>
            <Menu.Item key="2" 
                onClick={() => handlePush('/progression-checker')}
            >
                Progression Checker
            </Menu.Item>
            <Menu.Item key="3" 
                onClick={() => handlePush('/term-planner')}
            >
            Term Planner
            </Menu.Item>
            <Menu.ItemGroup key="customisation" title="Customisation">
                <Menu.Item key="4" 
                    onClick={() => handleThemeToggle}
                    icon={theme === "light" ? <IoMdMoon/> : <IoIosSunny/> }
                >
                    Change to {theme === "light" ? "dark" : "light"} theme
                </Menu.Item>
            </Menu.ItemGroup>
        </Menu>
    )
}
