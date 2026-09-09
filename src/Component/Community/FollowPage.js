import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import jaxios from '../../util/JWTUtil';
import { getProfileUrl } from './communityUtils';
import '../../style/Follow.css';

/**
 * 팔로워 / 팔로잉 목록 페이지
 * /follow?tab=followers  |  /follow?tab=followings
 */
function FollowPage() {
    const navigate = useNavigate();
    const loginUser = useSelector((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();

    const tab =
        searchParams.get('tab') === 'followings' ? 'followings' : 'followers';

    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 로그인 안 했으면 로그인으로
    useEffect(() => {
        if (!loginUser?.num) navigate('/login');
    }, [loginUser, navigate]);

    // 팔로우 관계
    const fetchFollowInfo = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const [followingRes, followerRes] = await Promise.all([
                jaxios.get('/api/member/getFollowings', {
                    params: { ffrom: loginUser.num },
                }),
                jaxios.get('/api/member/getFollowers', {
                    params: { fto: loginUser.num },
                }),
            ]);
            setFollowings(followingRes.data.followings || []);
            setFollowers(followerRes.data.followers || []);
        } catch (err) {
            console.error(err);
            setFollowings([]);
            setFollowers([]);
        }
    }, [loginUser.num]);

    useEffect(() => {
        fetchFollowInfo();
    }, [fetchFollowInfo]);

    // 관계 → 회원 정보
    const fetchUsers = useCallback(async () => {
        if (!loginUser?.num) return;
        setIsLoading(true);
        try {
            const nums =
                tab === 'followers'
                    ? followers.map((f) => f.ffrom)
                    : followings.map((f) => f.fto);

            const followingSet = new Set(followings.map((f) => Number(f.fto)));

            const list = await Promise.all(
                nums.map(async (num) => {
                    try {
                        const res = await axios.get(
                            '/api/member/getMemberByNum',
                            { params: { num } }
                        );
                        const m = res.data.loginUser;
                        if (!m) return null;
                        return {
                            num: m.num,
                            name: m.name,
                            profileImg: m.profileImg,
                            following: followingSet.has(Number(m.num)),
                        };
                    } catch (err) {
                        return null;
                    }
                })
            );

            setUsers(list.filter(Boolean));
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [tab, followers, followings, loginUser.num]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleTabClick = (next) => {
        if (next === tab) return;
        setSearchParams({ tab: next });
    };

    const handleToggleFollow = async (targetNum) => {
        try {
            await jaxios.post('/api/member/follow', {
                ffrom: loginUser.num,
                fto: targetNum,
            });
            await fetchFollowInfo();
        } catch (err) {
            console.error(err);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    return (
        <div className="follow-page">
            <header className="follow-page-head">
                <button
                    type="button"
                    className="follow-back"
                    aria-label="뒤로"
                    onClick={() => navigate('/community')}
                >
                    ‹
                </button>
                <div className="follow-page-title">
                    {loginUser?.name || '내'} 님의 친구
                </div>
            </header>

            <nav className="follow-tabs">
                <button
                    type="button"
                    className={`follow-tab ${tab === 'followers' ? 'active' : ''}`}
                    onClick={() => handleTabClick('followers')}
                >
                    팔로워
                    <span className="follow-tab-num">{followers.length}</span>
                </button>
                <button
                    type="button"
                    className={`follow-tab ${tab === 'followings' ? 'active' : ''}`}
                    onClick={() => handleTabClick('followings')}
                >
                    팔로잉
                    <span className="follow-tab-num">{followings.length}</span>
                </button>
            </nav>

            <div className="follow-list">
                {isLoading ? (
                    <div className="follow-empty">불러오는 중...</div>
                ) : users.length === 0 ? (
                    <div className="follow-empty">
                        <div className="follow-empty-icon">👥</div>
                        <div className="follow-empty-text">
                            {tab === 'followers'
                                ? '아직 팔로워가 없습니다'
                                : '아직 팔로우한 사람이 없습니다'}
                        </div>
                        <button
                            type="button"
                            className="follow-empty-btn"
                            onClick={() => navigate('/community')}
                        >
                            커뮤니티 둘러보기
                        </button>
                    </div>
                ) : (
                    users.map((u) => (
                        <div className="follow-item" key={u.num}>
                            <div className="follow-avatar">
                                {u.profileImg ? (
                                    <img
                                        src={getProfileUrl(u.profileImg)}
                                        alt=""
                                        className="follow-avatar-img"
                                    />
                                ) : (
                                    <div className="follow-avatar-placeholder" />
                                )}
                            </div>
                            <div className="follow-name">{u.name}</div>
                            <button
                                type="button"
                                className={`follow-btn ${u.following ? 'off' : ''}`}
                                onClick={() => handleToggleFollow(u.num)}
                            >
                                {u.following ? '팔로잉' : '맞팔로우'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FollowPage;
