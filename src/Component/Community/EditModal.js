import React from 'react';

/**
 * 게시글 수정 모달 (내용만 수정)
 */
function EditModal({ content, onContentChange, onSave, onClose }) {
    return (
        <div className="community-modal-overlay" onClick={onClose}>
            <div
                className="community-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="community-modal-title">게시글 수정</div>

                <textarea
                    className="community-modal-textarea"
                    placeholder="내용을 입력해주세요"
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
                    <div className="community-modal-save-btn" onClick={onSave}>
                        수정
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditModal;
