import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Head.css';

function Head({setActivate}) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { label: '식사 기록', path: '/meal' },
        { label: '체중 기록', path: '/weight' },
        { label: '운동 기록', path: '/exercise' },
        { label: '통계', path: '/stats' },
        { label: '커뮤니티', path: '/community' },
    ];

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleMenuItemClick = (path) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="header-container">
            <div className="header-bar">
                <div className='header-chatbot'><button className='header-chatbot-button' onClick={()=>{setActivate((prev)=>!prev)}}>FITLOG CHATBOT</button></div>
                <div className="header-hamburger-btn" onClick={handleToggleMenu}>
                    <span className="header-hamburger-line" />
                    <span className="header-hamburger-line" />
                    <span className="header-hamburger-line" />
                </div>
            </div>

            {isMenuOpen && (
                <>
                    <div
                        className="header-menu-overlay"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="header-menu-dropdown">
                        {menuItems.map((item) => (
                            <div
                                key={item.path}
                                className="header-menu-item"
                                onClick={() => handleMenuItemClick(item.path)}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Head;