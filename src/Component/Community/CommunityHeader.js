import React from 'react';
import { getProfileUrl } from './communityUtils';

/**
 * 상단 인사 + 팔로워/팔로잉 카운터
 */
function CommunityHeader({
    loginUser,
    followerCount,
    followingCount,
    onCountClick,
}) {
    return (
        <header className="community-header">
            <div className="community-me">
                <div className="community-me-avatar">
                    {loginUser?.profileImg ? (
                        <img
                            src={getProfileUrl(loginUser.profileImg)}
                            alt=""
                            className="community-me-avatar-img"
                        />
                    ) : (
                        <div className="community-me-avatar-placeholder" />
                    )}
                </div>
                <div className="community-me-text">
                    <div className="community-me-label">커뮤니티</div>
                    <div className="community-me-name">
                        {loginUser?.name || '게스트'}
                    </div>
                </div>
            </div>

            <div className="community-counts">
                <button
                    type="button"
                    className="community-count"
                    onClick={() => onCountClick('followers')}
                >
                    <span className="community-count-num">{followerCount}</span>
                    <span className="community-count-label">팔로워</span>
                </button>
                <span className="community-count-sep" />
                <button
                    type="button"
                    className="community-count"
                    onClick={() => onCountClick('followings')}
                >
                    <span className="community-count-num">
                        {followingCount}
                    </span>
                    <span className="community-count-label">팔로잉</span>
                </button>
            </div>
        </header>
    );
}

export default CommunityHeader;
