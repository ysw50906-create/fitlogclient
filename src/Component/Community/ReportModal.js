import React from 'react';

/**
 * 게시글 신고 모달
 */
function ReportModal({
    content,
    onContentChange,
    isReporting,
    onSubmit,
    onClose,
}) {
    return (
        <div className="community-modal-overlay" onClick={onClose}>
            <div
                className="community-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="community-modal-title">게시글 신고</div>
                <div className="community-modal-desc">
                    신고 사유를 작성해주세요
                </div>

                <textarea
                    className="community-modal-textarea"
                    placeholder="예) 욕설, 스팸, 부적절한 사진 등"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                />

                <div className="community-modal-actions">
                    <div
                        className="community-modal-cancel-btn"
                        onClick={onClose}
                    >
                        취소
                    </div>
                    <div
                        className={`community-modal-save-btn ${isReporting ? 'loading' : ''}`}
                        onClick={onSubmit}
                    >
                        {isReporting ? '접수 중...' : '신고'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportModal;
