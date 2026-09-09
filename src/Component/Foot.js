import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Foot.css';

// 프로필 이미지 경로 생성 (카카오는 전체 URL, 로컬은 서버 경로)
const toImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `/api/image/member/${encodeURIComponent(img)}`;
};

function Foot({ setActivate }) {
    const navigate = useNavigate();
    const loginUser = useSelector((state) => state.user);
    const [imgError, setImgError] = useState(false);
    const BREAKPOINT = 900;

    const profileUrl = toImageUrl(loginUser?.profileImg);

    const handleStatsClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/stats');
    };

    const handleContactClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/qna');
    };

    const handleLogoClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/');
    };

    const handleCommunityClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/community');
    };

    const handleProfileClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        if (!loginUser || !loginUser.id) navigate('/login');
        else if (loginUser.role_names?.includes('admin')) navigate('/admin');
        else navigate('/mypage');
    };

    return (
        <div className="footer-container">
            <div className="footer-menu-item" onClick={handleStatsClick}>
                통계
            </div>

            <div className="footer-menu-item" onClick={handleContactClick}>
                문의하기
            </div>

            <div className="footer-logo" onClick={handleLogoClick}>
                <img
                    src="/img/fitlog-logo.png"
                    alt="FITLOG"
                    className="footer-logo-img"
                />
            </div>

            <div className="footer-menu-item" onClick={handleCommunityClick}>
                커뮤니티
            </div>

            {/* 프사가 없거나 로딩 실패하면 기본 아이콘 */}
            <div className="footer-profile-btn" onClick={handleProfileClick}>
                {profileUrl && !imgError ? (
                    <img
                        alt=""
                        className="community-post-avatar-img"
                        src={profileUrl}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    '👤'
                )}
            </div>

        </div>
    );
}

export default Foot;