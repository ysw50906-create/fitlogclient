import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/qna/write.css'; // CSS 경로 확인

function Write() {
    const navigate = useNavigate();

    // 입력 상태 관리
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    // 이미지 업로드 및 미리보기 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // 미리보기 URL 생성
        }
    };

    // 취소 버튼
    const handleCancel = () => {
        if (window.confirm('작성을 취소하시겠습니까?')) {
            navigate(-1); // 이전 페이지로 이동
        }
    };

    // 등록 버튼 (서버 전송용)
    const handleSubmit = () => {
        if (!title.trim()) return alert('제목을 입력해주세요.');
        if (!content.trim()) return alert('내용을 입력해주세요.');
        if (!image) return alert('사진은 필수 항목입니다.');

        // TODO: 백엔드 API 연동 (FormData 사용)
        alert('게시글이 등록되었습니다!');
        navigate('/community');
    };

    return (
        <div className='community-write'>
            {/* 제목 영역 */}
            <div className='title'>
                <input
                    type='text'
                    placeholder='제목을 입력하세요'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* 내용 영역 */}
            <div className='post'>
                <textarea
                    placeholder='내용을 입력하세요'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* 사진 영역 */}
            <div className='community-photo'>
                <label htmlFor='file-upload' className='photo-label'>
                    {preview ? (
                        <img src={preview} alt='미리보기' className='preview-img' />
                    ) : (
                        <span>📷 사진 첨부 (필수)</span>
                    )}
                </label>
                <input
                    id='file-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />
            </div>

            {/* 취소/등록 버튼 영역 */}
            <div className='community-post'>
                <button type='button' className='btn-cancel' onClick={handleCancel}>취소</button>
                <button type='button' className='btn-submit' onClick={handleSubmit}>등록</button>
            </div>
        </div>
    );
}

export default Write;