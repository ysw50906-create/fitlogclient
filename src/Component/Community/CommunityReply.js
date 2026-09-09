import React from 'react';

/**
 * 게시글 하나의 댓글 영역
 */
function CommunityReply({
    postNum,
    loginUser,
    replies,
    replyContent,
    onReplyChange,
    onReplySubmit,
    onReplyDelete,
}) {
    return (
        <div className="community-reply-section">
            <div className="community-reply-list">
                {replies.length === 0 ? (
                    <div className="community-reply-empty">
                        첫 댓글을 남겨보세요
                    </div>
                ) : (
                    replies.map((reply) => (
                        <div className="community-reply-item" key={reply.num}>
                            <div className="community-reply-main">
                                <span className="community-reply-name">
                                    {reply.member?.name}
                                </span>
                                <span className="community-reply-content">
                                    {reply.content}
                                </span>
                            </div>
                            {Number(reply.member?.num) ===
                                Number(loginUser.num) && (
                                <span
                                    className="community-reply-delete"
                                    onClick={() =>
                                        onReplyDelete(reply.num, postNum)
                                    }
                                >
                                    ✕
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="community-reply-input-row">
                <input
                    type="text"
                    className="community-reply-input"
                    placeholder="댓글 달기..."
                    value={replyContent}
                    onChange={(e) => onReplyChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onReplySubmit(postNum);
                    }}
                />
                <button
                    type="button"
                    className="community-reply-submit"
                    onClick={() => onReplySubmit(postNum)}
                >
                    게시
                </button>
            </div>
        </div>
    );
}

export default CommunityReply;
