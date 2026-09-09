import React, { useRef } from 'react';
import { ALLOWED_TYPES } from './communityUtils';

/**
 * 새 게시글 작성 모달 (사진 필수)
 */
function WriteModal({
    content,
    onContentChange,
    preview,
    onFileSelect,
    isSaving,
    onSave,
    onClose,
}) {
    const imageInputRef = useRef(null);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }
        onFileSelect(file);
    };

    return (
        <div className="community-modal-overlay" onClick={onClose}>
            <div
                className="community-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="community-modal-title">새 게시글</div>

                <div
                    className="community-modal-photo"
                    onClick={() => imageInputRef.current?.click()}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt=""
                            className="community-modal-preview"
                        />
                    ) : (
                        <>
                            <div className="community-modal-photo-icon">📷</div>
                            <div className="community-modal-photo-text">
                                사진 선택 (필수)
                            </div>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    ref={imageInputRef}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

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
                    <div
                        className={`community-modal-save-btn ${isSaving ? 'loading' : ''}`}
                        onClick={onSave}
                    >
                        {isSaving ? '게시 중...' : '게시'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WriteModal;
