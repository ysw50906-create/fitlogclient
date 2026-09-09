import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jaxios from '../util/JWTUtil';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import '../style/Notice.css';

function Notice() {
    const [noticeList, setNoticeList] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [mode, setMode] = useState('list');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const loginUser = useSelector((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const isAdmin = loginUser?.role_names?.includes('admin');

    // 공지사항 목록 조회
    const fetchNoticeList = async () => {
        try {
            const response = await axios.get('/api/notice/getAllList');
            setNoticeList(response.data.list || []);
        } catch (error) {
            console.error('공지사항 목록 조회 실패:', error);
        }
    };

    // 공지사항 상세 조회
    const fetchNotice = async (num) => {
        try {
            const response = await axios.get(`/api/notice/getNotice/${num}`);
            const notice = response.data.notice;

            if (!notice) {
                alert('해당 공지사항을 찾을 수 없습니다.');
                setSelectedNotice(null);
                setMode('list');
                setSearchParams({});
                return;
            }

            setSelectedNotice(notice);
            setMode('detail');
        } catch (error) {
            console.error('공지사항 상세 조회 실패:', error);
            alert('공지사항을 불러오는데 실패했습니다.');
            setSelectedNotice(null);
            setMode('list');
        }
    };

    // 최초 실행
    useEffect(() => {
        fetchNoticeList();

        const num = searchParams.get('num');

        if (num) {
            fetchNotice(num);
        } else {
            setSelectedNotice(null);
            setMode('list');
        }
    }, []);

    // URL이 변경됐을 때
    useEffect(() => {
        const num = searchParams.get('num');

        if (num) {
            fetchNotice(num);
        } else {
            setSelectedNotice(null);
            setMode('list');
        }
    }, [searchParams]);

    // 공지사항 작성 화면
    const handleWriteClick = () => {
        setTitle('');
        setContent('');
        setMode('write');
        setSearchParams({});
    };

    // 공지사항 작성
    const handleWrite = async () => {
        if (!isAdmin) {
            alert('관리자만 공지사항을 작성할 수 있습니다.');
            return;
        }

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            await jaxios.post('/api/notice/writeNotice', {
                title: title,
                content: content
            });

            alert('공지사항이 등록되었습니다.');
            await fetchNoticeList();
            setTitle('');
            setContent('');
            setMode('list');
            setSearchParams({});
        } catch (error) {
            console.error('공지사항 작성 실패:', error);
            alert('공지사항 등록에 실패했습니다.');
        }
    };

    // 수정 화면
    const handleEditClick = () => {
        if (!selectedNotice) {
            return;
        }

        setTitle(selectedNotice.title);
        setContent(selectedNotice.content);
        setMode('edit');
    };

    // 공지사항 수정
    const handleUpdate = async () => {
        if (!isAdmin) {
            alert('관리자만 공지사항을 수정할 수 있습니다.');
            return;
        }

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            await jaxios.post('/api/notice/updateNotice', {
                num: selectedNotice.num,
                title: title,
                content: content
            });

            alert('공지사항이 수정되었습니다.');
            await fetchNoticeList();
            await fetchNotice(selectedNotice.num);
        } catch (error) {
            console.error('공지사항 수정 실패:', error);
            alert('공지사항 수정에 실패했습니다.');
        }
    };

    // 공지사항 삭제
    const handleDelete = async () => {
        if (!isAdmin) {
            alert('관리자만 공지사항을 삭제할 수 있습니다.');
            return;
        }

        if (!window.confirm('공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await jaxios.delete(`/api/notice/deleteNotice/${selectedNotice.num}`);
            alert('공지사항이 삭제되었습니다.');
            await fetchNoticeList();
            setSelectedNotice(null);
            setMode('list');
            setSearchParams({});
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            alert('공지사항 삭제에 실패했습니다.');
        }
    };

    // 목록으로
    const handleBackToList = () => {
        setSelectedNotice(null);
        setMode('list');
        setSearchParams({});
    };

    // 목록에서 공지 클릭
    const handleNoticeClick = (num) => {
        setSearchParams({ num: String(num) });
    };

    return (
        <div className="notice-container">
            {mode === 'list' && (
                <div className="notice-list-page">
                    <div className="notice-header">
                        <div>
                            <h2>공지사항</h2>
                            <p>서비스의 새로운 소식을 확인해주세요.</p>
                        </div>
                        {isAdmin && (
                            <button
                                className="notice-write-btn"
                                onClick={handleWriteClick}
                            >
                                공지사항 작성
                            </button>
                        )}
                    </div>
                    <div className="notice-list">
                        {noticeList.length === 0 ? (
                            <div className="notice-empty">
                                등록된 공지사항이 없습니다.
                            </div>
                        ) : (
                            noticeList.map((notice) => (
                                <div
                                    className="notice-item"
                                    key={notice.num}
                                    onClick={() => handleNoticeClick(notice.num)}
                                >
                                    <div className="notice-item-title">
                                        {notice.title}
                                    </div>
                                    <div className="notice-item-date">
                                        {notice.indate
                                            ? new Date(notice.indate).toLocaleDateString('ko-KR')
                                            : ''}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {mode === 'detail' && selectedNotice && (
                <div className="notice-detail-page">
                    <button
                        className="notice-back-btn"
                        onClick={handleBackToList}
                    >
                        ← 목록으로
                    </button>
                    <div className="notice-detail">
                        <div className="notice-detail-header">
                            <h2>{selectedNotice.title}</h2>
                            <span>
                                {selectedNotice.indate
                                    ? new Date(selectedNotice.indate).toLocaleDateString('ko-KR')
                                    : ''}
                            </span>
                        </div>
                        <div className="notice-detail-content">
                            {selectedNotice.content}
                        </div>
                        {isAdmin && (
                            <div className="notice-detail-buttons">
                                <button
                                    className="notice-edit-btn"
                                    onClick={handleEditClick}
                                >
                                    수정
                                </button>
                                <button
                                    className="notice-delete-btn"
                                    onClick={handleDelete}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(mode === 'write' || mode === 'edit') && (
                <div className="notice-form-page">
                    <button
                        className="notice-back-btn"
                        onClick={handleBackToList}
                    >
                        ← 목록으로
                    </button>
                    <div className="notice-form">
                        <h2>
                            {mode === 'write' ? '공지사항 작성' : '공지사항 수정'}
                        </h2>
                        <div className="notice-form-group">
                            <label>제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="공지사항 제목을 입력하세요."
                                maxLength={100}
                            />
                        </div>
                        <div className="notice-form-group">
                            <label>내용</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="공지사항 내용을 입력하세요."
                                maxLength={500}
                            />
                        </div>
                        <div className="notice-form-buttons">
                            <button
                                className="notice-cancel-btn"
                                onClick={handleBackToList}
                            >
                                취소
                            </button>
                            <button
                                className="notice-save-btn"
                                onClick={mode === 'write' ? handleWrite : handleUpdate}
                            >
                                {mode === 'write' ? '등록' : '수정'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notice;