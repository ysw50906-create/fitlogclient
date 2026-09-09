// 커뮤니티 공통 유틸

// 카카오 로그인 유저는 profileImg가 전체 URL, 일반 회원은 파일명
export const getProfileUrl = (profileImg) => {
    if (!profileImg) return null;
    if (profileImg.startsWith('http')) return profileImg;
    return `/api/image/member/${encodeURIComponent(profileImg)}`;
};

export const getPostImageUrl = (image) =>
    `/api/image/community/${encodeURIComponent(image)}`;

export const formatTimeAgo = (indate) => {
    const diff = Date.now() - new Date(indate).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    return `${Math.floor(hour / 24)}일 전`;
};

export const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];
