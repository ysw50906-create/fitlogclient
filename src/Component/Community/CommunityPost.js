import React from 'react';
import CommunityReply from './CommunityReply';
import {
    getProfileUrl,
    getPostImageUrl,
    formatTimeAgo,
} from './communityUtils';

/**
 * 게시글 카드 1개
 * 사진을 카드 상단에 깔고 작성자 정보를 그 위에 올리는 구조
 */
function CommunityPost({
    post,
    like,
    loginUser,
    isMine,
    isFollowing,
    isMenuOpen,
    onMenuClick,
    onEditClick,
    onDeleteClick,
    onFollowClick,
    onReportClick,
    onLikeClick,
    onCommentClick,
    reply,
}) {
    return (
        <article className="community-post">
            {/* 사진 + 작성자 오버레이 */}
            <div className="community-post-media">
                <img
                    className="community-post-photo"
                    src={getPostImageUrl(post.image)}
                    alt=""
                />
                <div className="community-post-scrim" />

                <div className="community-post-writer">
                    <div className="community-post-avatar">
                        {post.member?.profileImg ? (
                            <img
                                src={getProfileUrl(post.member.profileImg)}
                                alt=""
                                className="community-post-avatar-img"
                            />
                        ) : (
                            <div className="community-post-avatar-placeholder" />
                        )}
                    </div>
                    <div className="community-post-writer-text">
                        <div className="community-post-name">
                            {post.member?.name}
                        </div>
                        <div className="community-post-time">
                            {formatTimeAgo(post.indate)}
                        </div>
                    </div>
                </div>

                <div
                    className="community-post-menu-wrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="community-post-menu-trigger"
                        aria-label="더보기"
                        onClick={() => onMenuClick(post.num)}
                    >
                        ⋯
                    </button>

                    {isMenuOpen && (
                        <div className="community-post-menu">
                            {isMine ? (
                                <>
                                    <div
                                        className="community-post-menu-item"
                                        onClick={() => onEditClick(post)}
                                    >
                                        게시글 수정
                                    </div>
                                    <div
                                        className="community-post-menu-item danger"
                                        onClick={() => onDeleteClick(post.num)}
                                    >
                                        게시글 삭제
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="community-post-menu-item"
                                        onClick={() =>
                                            onFollowClick(post.member?.num)
                                        }
                                    >
                                        {isFollowing ? '팔로우 취소' : '팔로우'}
                                    </div>
                                    <div
                                        className="community-post-menu-item danger"
                                        onClick={() => onReportClick(post.num)}
                                    >
                                        게시글 신고
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 본문 + 액션 */}
            <div className="community-post-body">
                {post.content && (
                    <p className="community-post-content">{post.content}</p>
                )}

                <div className="community-post-actions">
                    <button
                        type="button"
                        className={`community-post-action ${like.isLiked ? 'liked' : ''}`}
                        onClick={() => onLikeClick(post)}
                    >
                        <span className="community-post-action-icon">
                            {like.isLiked ? '♥' : '♡'}
                        </span>
                        <span className="community-post-action-count">
                            {like.count}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`community-post-action ${reply.isOpen ? 'on' : ''}`}
                        onClick={() => onCommentClick(post.num)}
                    >
                        <span className="community-post-action-icon">💬</span>
                        <span className="community-post-action-count">
                            {reply.isOpen ? '닫기' : '댓글'}
                        </span>
                    </button>
                </div>
            </div>

            {/* 댓글 */}
            {reply.isOpen && (
                <CommunityReply
                    postNum={post.num}
                    loginUser={loginUser}
                    replies={reply.list}
                    replyContent={reply.content}
                    onReplyChange={reply.onChange}
                    onReplySubmit={reply.onSubmit}
                    onReplyDelete={reply.onDelete}
                />
            )}
        </article>
    );
}

export default CommunityPost;
