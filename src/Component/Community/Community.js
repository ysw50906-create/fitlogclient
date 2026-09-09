import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jaxios from '../../util/JWTUtil';
import CommunityHeader from './CommunityHeader';
import CommunityPost from './CommunityPost';
import WriteModal from './WriteModal';
import EditModal from './EditModal';
import ReportModal from './ReportModal';
import '../../style/Community.css';

const PAGE_SIZE = 3;

const TABS = [
    { key: 'all', label: '전체보기' },
    { key: 'following', label: '팔로잉' },
    { key: 'mine', label: '내 게시글' },
];

// 실제로 스크롤되는 조상 엘리먼트 찾기
const getScrollParent = (node) => {
    let el = node?.parentElement;

    while (el) {
        const { overflowY } = window.getComputedStyle(el);

        if (overflowY === 'auto' || overflowY === 'scroll') {
            return el;
        }

        el = el.parentElement;
    }

    return null;
};

function Community() {
    const loginUser = useSelector((state) => state.user);
    const navigate = useNavigate();

    // ===================== 무한 스크롤 =====================

    const containerRef = useRef(null);
    const scrollerRef = useRef(null);

    const [showTopBtn, setShowTopBtn] = useState(false);

    // 현재 불러온 페이지
    const [page, setPage] = useState(1);

    // 추가 게시글 불러오는 중인지
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // 더 불러올 게시글이 있는지
    const [hasMore, setHasMore] = useState(true);

    // ===================== 기본 상태 =====================

    const [activeTab, setActiveTab] = useState('all');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 글쓰기
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [inputContent, setInputContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // 댓글
    const [openReplyNum, setOpenReplyNum] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');

    // 좋아요
    const [likeMap, setLikeMap] = useState({});

    // 점 메뉴 / 팔로우
    const [openMenuNum, setOpenMenuNum] = useState(null);
    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);

    // 게시글 수정
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editPost, setEditPost] = useState(null);
    const [editContent, setEditContent] = useState('');

    // 신고
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportPostNum, setReportPostNum] = useState(null);
    const [reportContent, setReportContent] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    // ===================== 조회 =====================

    // 게시글별 좋아요 목록 조회
    const fetchLikes = useCallback(
        async (postList) => {
            const map = {};

            await Promise.all(
                postList.map(async (post) => {
                    try {
                        const res = await axios.get(
                            '/api/community/getLikeList',
                            {
                                params: { num: post.num },
                            }
                        );

                        const likeList = res.data.likeList || [];

                        map[post.num] = {
                            count: likeList.length,
                            isLiked: likeList.some(
                                (like) =>
                                    Number(like.member?.num) ===
                                    Number(loginUser.num)
                            ),
                        };
                    } catch (err) {
                        map[post.num] = {
                            count: 0,
                            isLiked: false,
                        };
                    }
                })
            );

            setLikeMap((prev) => ({
                ...prev,
                ...map,
            }));
        },
        [loginUser.num]
    );

    // ===================== 게시글 조회 =====================

    // 현재 탭의 게시글 1페이지 조회
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);

        // 탭 변경 시 페이징 초기화
        setPage(1);
        setHasMore(true);
        setPosts([]);
        setLikeMap({});

        try {
            let res;

            if (activeTab === 'all') {
                res = await axios.get('/api/community/getPostList', {
                    params: {
                        page: 1,
                    },
                });
            } else if (activeTab === 'following') {
                res = await jaxios.get('/api/community/followingPost', {
                    params: {
                        mnum: loginUser.num,
                        page: 1,
                    },
                });
            } else {
                res = await jaxios.get('/api/community/userPost', {
                    params: {
                        mnum: loginUser.num,
                        page: 1,
                    },
                });
            }

            const postList = res.data.postList || [];
            const paging = res.data.paging;

            setPosts(postList);

            // 서버 Paging 기준으로 다음 페이지 존재 여부 판단
            if (paging) {
                setHasMore(paging.page < paging.totalPage);
            } else {
                // paging이 없으면 게시글 개수로 판단
                setHasMore(postList.length >= PAGE_SIZE);
            }

            // 좋아요 조회
            if (postList.length > 0) {
                fetchLikes(postList);
            }
        } catch (err) {
            console.error('게시글 조회 실패:', err);

            setPosts([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, loginUser.num, fetchLikes]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // ===================== 다음 페이지 조회 =====================

    const fetchMorePosts = useCallback(async () => {
        // 이미 불러오는 중이면 중복 요청 방지
        if (isLoading || isLoadingMore || !hasMore) {
            return;
        }

        const nextPage = page + 1;

        setIsLoadingMore(true);

        try {
            let res;

            if (activeTab === 'all') {
                res = await axios.get('/api/community/getPostList', {
                    params: {
                        page: nextPage,
                    },
                });
            } else if (activeTab === 'following') {
                res = await jaxios.get('/api/community/followingPost', {
                    params: {
                        mnum: loginUser.num,
                        page: nextPage,
                    },
                });
            } else {
                res = await jaxios.get('/api/community/userPost', {
                    params: {
                        mnum: loginUser.num,
                        page: nextPage,
                    },
                });
            }

            const newPosts = res.data.postList || [];
            const paging = res.data.paging;

            // 더 이상 게시글이 없으면 종료
            if (newPosts.length === 0) {
                setHasMore(false);
                return;
            }

            // 기존 게시글 + 다음 페이지 게시글
            setPosts((prev) => {
                // 혹시 중복으로 들어오는 게시글 방지
                const existingNums = new Set(
                    prev.map((post) => post.num)
                );

                const uniquePosts = newPosts.filter(
                    (post) => !existingNums.has(post.num)
                );

                return [...prev, ...uniquePosts];
            });

            // 현재 페이지 갱신
            setPage(nextPage);

            // 서버 Paging 기준으로 마지막 페이지 판단
            if (paging) {
                setHasMore(nextPage < paging.totalPage);
            } else {
                setHasMore(newPosts.length >= PAGE_SIZE);
            }

            // 새로 가져온 게시글의 좋아요 조회
            fetchLikes(newPosts);
        } catch (err) {
            console.error('추가 게시글 조회 실패:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [
        activeTab,
        loginUser.num,
        page,
        isLoading,
        isLoadingMore,
        hasMore,
        fetchLikes,
    ]);

    // ===================== 무한 스크롤 =====================

    useEffect(() => {
        const scroller = getScrollParent(containerRef.current);

        scrollerRef.current = scroller;

        const target = scroller || window;

        const onScroll = () => {
            const top = scroller
                ? scroller.scrollTop
                : window.scrollY;

            const viewH = scroller
                ? scroller.clientHeight
                : window.innerHeight;

            const totalH = scroller
                ? scroller.scrollHeight
                : document.documentElement.scrollHeight;

            // 맨 위로 버튼
            setShowTopBtn(top > 320);

            // 바닥에서 320px 남았을 때 다음 페이지 조회
            if (top > 0 && top + viewH >= totalH - 320) {
                fetchMorePosts();
            }
        };

        target.addEventListener('scroll', onScroll, {
            passive: true,
        });

        // 처음 렌더링될 때도 한번 검사
        onScroll();

        return () => {
            target.removeEventListener('scroll', onScroll);
        };
    }, [fetchMorePosts]);

    // ===================== 맨 위로 =====================

    const scrollToTop = () => {
        const scroller = scrollerRef.current;

        if (scroller) {
            scroller.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    // ===================== 팔로워 / 팔로잉 관계 =====================

    const fetchFollowInfo = useCallback(async () => {
        if (!loginUser?.num) return;

        try {
            const [followingRes, followerRes] = await Promise.all([
                jaxios.get('/api/member/getFollowings', {
                    params: {
                        ffrom: loginUser.num,
                    },
                }),
                jaxios.get('/api/member/getFollowers', {
                    params: {
                        fto: loginUser.num,
                    },
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

    // ===================== 댓글 조회 =====================

    const fetchReplies = async (cnum) => {
        try {
            const res = await axios.get(
                '/api/community/getReplyList',
                {
                    params: {
                        num: cnum,
                    },
                }
            );

            setReplies(res.data.replyList || []);
        } catch (err) {
            console.error(err);
            setReplies([]);
        }
    };

    // ===================== 탭 =====================

    const handleTabClick = (key) => {
        if (key === activeTab) return;
        if (key !== 'all' && !loginUser.num) return window.alert("로그인이 필요한 서비스입니다.")

        setActiveTab(key);
        setOpenReplyNum(null);
        setOpenMenuNum(null);
    };

    // ===================== 글쓰기 =====================

    const handleWriteClick = () => {
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        setInputContent('');
        setImageFile(null);
        setImagePreview(null);
        setIsWriteOpen(true);
    };

    const handleFileSelect = (file) => {
        setImageFile(file);

        const reader = new FileReader();

        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
        };

        reader.readAsDataURL(file);
    };

    const handleWriteSave = async () => {
        if (isSaving) return;

        if (!imageFile) {
            alert('사진을 선택해주세요.');
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const uploadRes = await jaxios.post(
                '/api/community/fileupload',
                formData
            );

            const filename = uploadRes.data.filename;

            if (!filename) {
                alert('사진 업로드에 실패했습니다.');
                return;
            }

            const community = {
                member: {
                    num: loginUser.num,
                },
                content: inputContent,
                image: filename,
            };

            const res = await jaxios.post(
                '/api/community/writePost',
                community
            );

            if (res.data.postid) {
                setIsWriteOpen(false);
                fetchPosts();
            } else {
                alert('게시글 작성에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // ===================== 좋아요 =====================

    const handleLikeClick = async (post) => {
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const res = await jaxios.post(
                '/api/community/addLike',
                {
                    member: {
                        num: loginUser.num,
                    },
                    community: {
                        num: post.num,
                    },
                }
            );

            if (res.data.msg === 'OK') {
                const likeRes = await axios.get(
                    '/api/community/getLikeList',
                    {
                        params: {
                            num: post.num,
                        },
                    }
                );

                const likeList = likeRes.data.likeList || [];

                setLikeMap((prev) => ({
                    ...prev,
                    [post.num]: {
                        count: likeList.length,
                        isLiked: likeList.some(
                            (like) =>
                                Number(like.member?.num) ===
                                Number(loginUser.num)
                        ),
                    },
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ===================== 댓글 =====================

    const handleCommentClick = async (num) => {
        if (openReplyNum === num) {
            setOpenReplyNum(null);
            return;
        }

        setOpenReplyNum(num);
        setReplyContent('');

        fetchReplies(num);
    };

    const handleReplySubmit = async (cnum) => {
        if (!replyContent.trim()) return;

        try {
            await jaxios.post(
                '/api/community/writeReply',
                {
                    member: {
                        num: loginUser.num,
                    },
                    community: {
                        num: cnum,
                    },
                    content: replyContent,
                }
            );

            setReplyContent('');
            fetchReplies(cnum);
        } catch (err) {
            console.error(err);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleReplyDelete = async (replyNum, cnum) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await jaxios.delete(
                `/api/community/deleteReply/${replyNum}`
            );

            fetchReplies(cnum);
        } catch (err) {
            console.error(err);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    // ===================== 게시글 수정 / 삭제 =====================

    const handleMenuClick = (num) => {
        setOpenMenuNum(
            openMenuNum === num ? null : num
        );
    };

    const handleEditClick = (post) => {
        setEditPost(post);
        setEditContent(post.content || '');
        setIsEditOpen(true);
        setOpenMenuNum(null);
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            const res = await jaxios.post(
                '/api/community/updatePost',
                {
                    num: editPost.num,
                    content: editContent,
                }
            );

            if (res.data.msg === 'OK') {
                setIsEditOpen(false);
                fetchPosts();
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('게시글 수정에 실패했습니다.');
        }
    };

    const handleDeleteClick = async (num) => {
        setOpenMenuNum(null);

        if (!window.confirm('게시글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await jaxios.delete(
                `/api/community/deletePost/${num}`
            );

            if (openReplyNum === num) {
                setOpenReplyNum(null);
            }

            fetchPosts();
        } catch (err) {
            console.error(err);
            alert('게시글 삭제에 실패했습니다.');
        }
    };

    // ===================== 팔로우 =====================

    const handleFollowClick = async (targetNum) => {
        setOpenMenuNum(null);

        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await jaxios.post(
                '/api/member/follow',
                {
                    ffrom: loginUser.num,
                    fto: targetNum,
                }
            );

            fetchFollowInfo();

            if (activeTab === 'following') {
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    const handleCountClick = (tab) => {
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        navigate(`/follow?tab=${tab}`);
    };

    // ===================== 신고 =====================

    const handleReportClick = (postNum) => {
        setOpenMenuNum(null);

        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        setReportPostNum(postNum);
        setReportContent('');
        setIsReportOpen(true);
    };

    const handleReportSubmit = async () => {
        if (isReporting) return;

        if (!reportContent.trim()) {
            alert('신고 내용을 입력해주세요.');
            return;
        }

        setIsReporting(true);

        try {
            const res = await jaxios.post(
                '/api/community/report',
                {
                    member: {
                        num: loginUser.num,
                    },
                    community: {
                        num: reportPostNum,
                    },
                    content: reportContent,
                }
            );

            if (res.data.msg === 'OK') {
                setIsReportOpen(false);
                alert('신고가 접수되었습니다.');
            } else {
                alert('신고에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('신고에 실패했습니다.');
        } finally {
            setIsReporting(false);
        }
    };

    // ===================== 빈 화면 =====================

    const getEmptyText = () => {
        if (activeTab === 'following') {
            return followings.length === 0
                ? '아직 팔로우한 사람이 없습니다'
                : '팔로우한 사람의 게시글이 없어요';
        }

        if (activeTab === 'mine') {
            return '아직 작성한 게시글이 없어요';
        }

        return '아직 게시글이 없어요';
    };

    const getEmptyIcon = () => {
        if (
            activeTab === 'following' &&
            followings.length === 0
        ) {
            return '👥';
        }

        return '📝';
    };

    // ===================== 화면 =====================

    return (
        <div
            className="community-container"
            ref={containerRef}
        >
            <CommunityHeader
                loginUser={loginUser}
                followerCount={followers.length}
                followingCount={followings.length}
                onCountClick={handleCountClick}
            />

            <nav className="community-tabs">
                {TABS.map((tab) => (
                    <button
                        type="button"
                        key={tab.key}
                        className={`community-tab ${activeTab === tab.key
                            ? 'active'
                            : ''
                            }`}
                        onClick={() =>
                            handleTabClick(tab.key)
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* 피드 */}
            <div
                className="community-feed"
                onClick={() => setOpenMenuNum(null)}
            >
                {isLoading ? (
                    <div className="community-empty">
                        <div className="community-empty-text">
                            불러오는 중...
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="community-empty">
                        <div className="community-empty-icon">
                            {getEmptyIcon()}
                        </div>

                        <div className="community-empty-text">
                            {getEmptyText()}
                        </div>
                    </div>
                ) : (
                    posts.map((post) => (
                        <CommunityPost
                            key={post.num}
                            post={post}
                            like={
                                likeMap[post.num] || {
                                    count: 0,
                                    isLiked: false,
                                }
                            }
                            loginUser={loginUser}
                            isMine={
                                Number(post.member?.num) ===
                                Number(loginUser.num)
                            }
                            isFollowing={followings.some(
                                (f) =>
                                    Number(f.fto) ===
                                    Number(post.member?.num)
                            )}
                            isMenuOpen={
                                openMenuNum === post.num
                            }
                            onMenuClick={handleMenuClick}
                            onEditClick={handleEditClick}
                            onDeleteClick={handleDeleteClick}
                            onFollowClick={handleFollowClick}
                            onReportClick={handleReportClick}
                            onLikeClick={handleLikeClick}
                            onCommentClick={handleCommentClick}
                            reply={{
                                isOpen:
                                    openReplyNum ===
                                    post.num,
                                list: replies,
                                content: replyContent,
                                onChange: setReplyContent,
                                onSubmit: handleReplySubmit,
                                onDelete:
                                    handleReplyDelete,
                            }}
                        />
                    ))
                )}

                {/* 추가 게시글 로딩 */}
                {isLoadingMore && (
                    <div className="community-more">
                        불러오는 중...
                    </div>
                )}

                {/* 마지막 페이지 */}
                {posts.length > 0 &&
                    !hasMore &&
                    !isLoadingMore && (
                        <div className="community-end">
                            모든 게시글을 확인했어요
                        </div>
                    )}
            </div>

            {/* 글쓰기 버튼 */}
            <div className="community-fabs">
                {showTopBtn && (
                    <button
                        type="button"
                        className="community-top-btn"
                        aria-label="맨 위로"
                        onClick={scrollToTop}
                    >
                        ↑
                    </button>
                )}

                {openReplyNum === null && (
                    <button
                        type="button"
                        className="community-write-btn"
                        onClick={handleWriteClick}
                    >
                        <span className="community-write-icon">
                            ✏️
                        </span>

                        <span className="community-write-text">
                            기록하기
                        </span>
                    </button>
                )}
            </div>

            {/* 글쓰기 모달 */}
            {isWriteOpen && (
                <WriteModal
                    content={inputContent}
                    onContentChange={setInputContent}
                    preview={imagePreview}
                    onFileSelect={handleFileSelect}
                    isSaving={isSaving}
                    onSave={handleWriteSave}
                    onClose={() =>
                        setIsWriteOpen(false)
                    }
                />
            )}

            {/* 수정 모달 */}
            {isEditOpen && (
                <EditModal
                    content={editContent}
                    onContentChange={setEditContent}
                    onSave={handleEditSave}
                    onClose={() =>
                        setIsEditOpen(false)
                    }
                />
            )}

            {/* 신고 모달 */}
            {isReportOpen && (
                <ReportModal
                    content={reportContent}
                    onContentChange={setReportContent}
                    isReporting={isReporting}
                    onSubmit={handleReportSubmit}
                    onClose={() =>
                        setIsReportOpen(false)
                    }
                />
            )}
        </div>
    );
}

export default Community;