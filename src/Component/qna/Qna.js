import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jaxios from '../../util/JWTUtil';
import '../../style/qna/qna.css';

function Qna() {
    const loginUser = useSelector((state) => state.user);

    // 탭 키 정의: faq, history, ask
    const [activeTab, setActiveTab] = useState('faq');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // 1:1 문의 폼 상태
    const [askForm, setAskForm] = useState({
        title: '',
        content: ''
    });

    const TABS = [
        { key: 'faq', label: '자주묻는 질문' },
        { key: 'history', label: '나의 문의내역' },
        { key: 'ask', label: '1:1 문의하기' },
    ];

    // 데이터 조회 (선택된 탭에 맞춰 API 호출)
    const fetchPosts = useCallback(async () => {
        // 1:1 문의하기 탭에서는 목록 조회를 하지 않음
        if (activeTab === 'ask') return;

        setIsLoading(true);
        try {
            let res;
            if (activeTab === 'faq') {
                // res = await axios.get('/api/qna/getfaq');
            } else if (activeTab === 'history') {
                res = await jaxios.get('/api/qna/getList', {
                    params: { mnum: loginUser?.num },
                });

            }

            const postList = res?.data?.qnaList || [];
            setPosts(postList);
        } catch (err) {
            console.error(err);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, loginUser?.num]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // 탭 변경 핸들러
    const handleTabChange = (tabKey) => {
        if (!loginUser.num && tabKey !== 'faq') {
            window.alert("로그인 후 이용하세요.")
            return;
        }
        setActiveTab(tabKey);
    };

    // 1:1 문의 폼 입력 핸들러
    const handleAskChange = (e) => {
        const { name, value } = e.target;
        setAskForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 1:1 문의 제출 핸들러
    const handleAskSubmit = async (e) => {
        e.preventDefault();
        if (!askForm.title.trim() || !askForm.content.trim()) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }

        try {
            await jaxios.post('/api/qna/writeQna', {
                subject: askForm.title,
                content: askForm.content,
                member: { num: loginUser?.num },
            });
            alert('문의가 성공적으로 접수되었습니다.');
            setAskForm({ title: '', content: '' });
            setActiveTab('history'); // 제출 후 내역 탭으로 이동
        } catch (err) {
            console.error(err);
            alert('문의 접수에 실패했습니다.');
        }
    };

    const handleToggleDetail = (num) => {
        setExpandedId((prev) => (prev === num ? null : num));
    };


    return (
        <div className="qna-container">
            {/* 상단 탭 메뉴 (TABS 배열 동적 렌더링) */}
            <div className="qna-tab-menu">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 탭별 컨텐츠 영역 */}
            <div className="qna-content">
                {/* 1. 자주묻는 질문 (FAQ) */}
                {activeTab === 'faq' && (
                    <div className="tab-pane">
                        <h3>❓ 자주묻는 질문</h3>
                        {isLoading ? (
                            <p>로딩 중...</p>
                        ) : (
                            // <div className="faq-list">
                            //     <div className="faq-item">
                            //         <p className="faq-question">배송은 얼마나 걸리나요?</p>
                            //         <p className="faq-answer">결제 완료 후 영업일 기준 2~3일 이내에 배송됩니다.</p>
                            //     </div>
                            //     <div className="faq-item">
                            //         <p className="faq-question">교환/반품 신청은 어떻게 하나요?</p>
                            //         <p className="faq-answer">마이페이지 &gt; 주문내역에서 반품/교환 신청이 가능합니다.</p>
                            //     </div>
                            // </div>
                            <div className="faq-list">
                                <div className="faq-item">
                                    <p className="faq-question">FitLog는 어떤 서비스인가요?</p>
                                    <p className="faq-answer">FitLog는 식단과 운동을 기록하고 하루 동안 섭취한 영양소와 운동량을 한눈에 관리할 수 있는 다이어트 관리 서비스입니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">식단은 어떻게 기록하나요?</p>
                                    <p className="faq-answer">음식 이름을 직접 검색하거나 음식 사진을 등록하여 식단을 기록할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">음식 사진으로 식단을 기록할 수 있나요?</p>
                                    <p className="faq-answer">네. 음식 사진을 업로드하면 AI가 사진 속 음식을 인식하여 식단 기록을 도와줍니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">음식의 영양정보는 어디서 확인하나요?</p>
                                    <p className="faq-answer">식단을 기록하면 해당 음식의 칼로리와 탄수화물, 단백질, 지방 등의 영양정보를 확인할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">등록된 음식이 아닌 경우에는 어떻게 하나요?</p>
                                    <p className="faq-answer">등록된 음식이 없는 경우 AI를 통해 해당 음식의 1인분 기준 영양정보를 추정하여 기록할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">운동 기록도 할 수 있나요?</p>
                                    <p className="faq-answer">네. 운동 종류와 운동 시간을 기록하고 예상 소모 칼로리를 확인할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">하루 목표 칼로리는 어떻게 설정하나요?</p>
                                    <p className="faq-answer">사용자의 다이어트 목표에 맞춰 하루 목표 칼로리와 탄수화물, 단백질, 지방 섭취량을 설정할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">오늘 먹은 음식의 영양소를 확인할 수 있나요?</p>
                                    <p className="faq-answer">네. 오늘 기록한 식단을 기준으로 총 섭취 칼로리와 탄수화물, 단백질, 지방의 섭취량을 확인할 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">AI에게 식단 추천을 받을 수 있나요?</p>
                                    <p className="faq-answer">네. 현재 설정된 목표와 오늘 섭취한 영양소를 바탕으로 남은 칼로리와 영양소에 맞는 식단을 추천받을 수 있습니다.</p>
                                </div>

                                <div className="faq-item">
                                    <p className="faq-question">FitLog의 AI는 어떤 질문에 답변할 수 있나요?</p>
                                    <p className="faq-answer">식단, 영양, 운동, 다이어트와 관련된 질문에 답변하며 사용자의 기록과 목표를 바탕으로 맞춤형 정보를 제공합니다.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. 나의 문의내역 */}
                {activeTab === 'history' && (
                    <div className="tab-pane">
                        <h3>📋 나의 문의내역</h3>
                        {isLoading ? (
                            <p>로딩 중...</p>
                        ) : (
                            <div className="history-list">
                                {posts.length > 0 ? (
                                    posts.map((post) => {
                                        const isOpen = expandedId === post.num;
                                        return (
                                            <div
                                                className={`history-item ${isOpen ? 'open' : ''}`}
                                                key={post.num}
                                                onClick={() => handleToggleDetail(post.num)}
                                            >
                                                <div className="history-header">
                                                    <span className={`status ${post.reply ? 'completed' : 'pending'}`}>
                                                        {post.reply ? '답변완료' : '답변대기'}
                                                    </span>
                                                    <span className="history-title">{post.subject}</span>
                                                    <span className="history-date">{post.indate?.slice(0, 10)}</span>
                                                </div>

                                                {isOpen && (
                                                    <div className="history-detail">
                                                        <div className="detail-block">
                                                            <p className="detail-label">문의 내용</p>
                                                            <p className="detail-content">{post.content}</p>
                                                        </div>
                                                        {post.reply && (
                                                            <div className="detail-block reply-block">
                                                                <p className="detail-label">답변</p>
                                                                <p className="detail-content">{post.reply}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="history-item">
                                        <div className="history-header">
                                            <span className="status completed">답변완료</span>
                                            <span className="history-title">배송 일정 관련 문의드립니다.</span>
                                            <span className="history-date">2026.08.20</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. 1:1 문의하기 */}
                {activeTab === 'ask' && (
                    <div className="tab-pane">
                        <h3>✍️ 1:1 문의하기</h3>
                        <form onSubmit={handleAskSubmit} className="ask-form">
                            <div className="form-group">
                                <label htmlFor="title">제목</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="문의 제목을 입력하세요"
                                    value={askForm.title}
                                    onChange={handleAskChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">문의 내용</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    rows="6"
                                    placeholder="문의하실 내용을 자세히 적어주세요."
                                    value={askForm.content}
                                    onChange={handleAskChange}
                                />
                            </div>
                            <button type="submit" className="submit-btn">
                                문의 접수하기
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Qna;