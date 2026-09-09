import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import jaxios from '../util/JWTUtil';
import { logoutAction } from '../store/userSlice';
import '../style/Admin.css';

const fmtDate = (v) => (v ? String(v).slice(0, 10) : '-');

function Admin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const loginUser = useSelector((state) => state.user);
    const isAdmin = loginUser?.role_names?.includes('admin');
    const loggingOut = useRef(false);

    const [tab, setTab] = useState('report');     // report | qna
    const [status, setStatus] = useState('wait'); // wait | done
    const [list, setList] = useState([]);
    const [openNum, setOpenNum] = useState(null);
    const [input, setInput] = useState({});

    useEffect(() => {
        if (loggingOut.current) return;   // 직접 로그아웃한 경우는 통과
        if (!isAdmin) {
            alert('관리자만 접근할 수 있습니다.');
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadList = useCallback(async () => {
        try {
            if (tab === 'report') {
                const res = await jaxios.get('/api/community/reportList', {
                    params: { status },
                });
                setList(res.data.reportList || []);
            } else {
                const res = await jaxios.get('/api/qna/getAllList', {
                    params: { status },
                });
                setList(res.data.qnaList || []);
            }
            setOpenNum(null);
            setInput({});
        } catch (err) {
            console.error(err);
            alert('목록을 불러오지 못했습니다.');
        }
    }, [tab, status]);

    useEffect(() => {
        if (isAdmin) loadList();
    }, [isAdmin, loadList]);

    const handleTab = (t) => {
        setTab(t);
        setStatus('wait');
    };

    const handleLogout = () => {
        if (!window.confirm('로그아웃 하시겠습니까?')) return;
        loggingOut.current = true;
        cookies.remove('user', { path: '/' });
        dispatch(logoutAction());
        navigate('/');
    };

    // 신고 처리
    const handleProcess = async (num) => {
        const memo = (input[num] || '').trim();
        if (!memo) return alert('처리 내용을 입력해주세요.');
        if (!window.confirm('처리하면 해당 게시글이 숨김 처리됩니다. 진행할까요?')) return;

        try {
            const res = await jaxios.post('/api/community/processReport', null, {
                params: { num, memo },
            });
            if (res.data.msg === 'OK') {
                alert('처리되었습니다.');
                loadList();
            }
        } catch (err) {
            console.error(err);
            alert('처리에 실패했습니다.');
        }
    };

    // 문의 답변
    const handleReply = async (num) => {
        const reply = (input[num] || '').trim();
        if (!reply) return alert('답변을 입력해주세요.');

        try {
            const res = await jaxios.post('/api/qna/replyQna', null, {
                params: { num, reply },
            });
            if (res.data.msg === 'OK') {
                alert('답변이 등록되었습니다.');
                loadList();
            }
        } catch (err) {
            console.error(err);
            alert('답변 등록에 실패했습니다.');
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-container">
            {/* 헤더 */}
            <div className="admin-header-card">
                <div className="admin-header-left">
                    <div className="admin-title">관리자 페이지</div>
                    <div className="admin-sub">{loginUser.name}님, 반갑습니다</div>
                </div>
                <button
                    type="button"
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >
                    로그아웃
                </button>
            </div>

            {/* 탭 */}
            <div className="admin-tabs">
                <div
                    className={`admin-tab ${tab === 'report' ? 'active' : ''}`}
                    onClick={() => handleTab('report')}
                >
                    신고 내역
                </div>
                <div
                    className={`admin-tab ${tab === 'qna' ? 'active' : ''}`}
                    onClick={() => handleTab('qna')}
                >
                    문의 내역
                </div>
            </div>

            {/* 리스트 */}
            <div className="admin-section">
                <div className="admin-section-head">
                    <div className="admin-section-title">
                        {tab === 'report' ? '신고 목록' : '문의 목록'}
                        <span className="admin-count">{list.length}</span>
                    </div>
                    <div className="admin-filters">
                        <div
                            className={`admin-filter ${status === 'wait' ? 'active' : ''}`}
                            onClick={() => setStatus('wait')}
                        >
                            {tab === 'report' ? '미처리' : '미답변'}
                        </div>
                        <div
                            className={`admin-filter ${status === 'done' ? 'active' : ''}`}
                            onClick={() => setStatus('done')}
                        >
                            완료
                        </div>
                    </div>
                </div>

                {list.length === 0 ? (
                    <div className="admin-empty">
                        {tab === 'report' ? '신고 내역이 없습니다' : '문의 내역이 없습니다'}
                    </div>
                ) : tab === 'report' ? (
                    /* ===== 신고 내역 ===== */
                    list.map((r) => (
                        <div className="admin-item" key={r.num}>
                            <div
                                className="admin-item-head"
                                onClick={() => setOpenNum(openNum === r.num ? null : r.num)}
                            >
                                <div className="admin-item-body">
                                    <div className="admin-item-title">{r.content}</div>
                                    <div className="admin-item-meta">
                                        <span className="admin-tag">
                                            게시글 #{r.community?.num ?? '-'}
                                        </span>
                                        신고자 {r.member?.name || '알 수 없음'}
                                    </div>
                                </div>
                                <div className="admin-arrow">
                                    {openNum === r.num ? '▲' : '▼'}
                                </div>
                            </div>

                            {openNum === r.num && (
                                <div className="admin-item-detail">
                                    <div className="admin-detail-label">신고자</div>
                                    <div className="admin-detail-box">
                                        <div className="admin-detail-text">
                                            {r.member?.name || '알 수 없음'}
                                            {r.member?.id && ` (${r.member.id})`}
                                        </div>
                                    </div>

                                    <div className="admin-detail-label">신고된 게시글</div>
                                    <div className="admin-detail-box">
                                        <div className="admin-detail-title">
                                            {r.community?.image && (
                                                <img
                                                    style={{ width: '350px' }}
                                                    src={`/api/image/community/${r.community.image}`}
                                                    alt="신고 게시글"
                                                />
                                            )}
                                        </div>
                                        <div className="admin-detail-text">
                                            {r.community?.member?.name || '작성자 없음'}
                                            <span className="admin-dot">·</span>
                                            {fmtDate(r.community?.indate)}
                                        </div>
                                        <div className="admin-detail-text">
                                            {r.community?.content || '-'}
                                        </div>
                                    </div>

                                    {status === 'wait' ? (
                                        <div className="admin-action-row">
                                            <input
                                                type="text"
                                                className="admin-input"
                                                value={input[r.num] || ''}
                                                onChange={(e) =>
                                                    setInput({ ...input, [r.num]: e.target.value })
                                                }
                                                placeholder="처리 내용을 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="admin-submit-btn"
                                                onClick={() => handleProcess(r.num)}
                                            >
                                                처리
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="admin-detail-label">처리 내용</div>
                                            <div className="admin-answer-box">{r.memo}</div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    /* ===== 문의 내역 ===== */
                    list.map((q) => (
                        <div className="admin-item" key={q.num}>
                            <div
                                className="admin-item-head"
                                onClick={() => setOpenNum(openNum === q.num ? null : q.num)}
                            >
                                <div className="admin-item-body">
                                    <div className="admin-item-title">{q.subject}</div>
                                    <div className="admin-item-meta">
                                        {q.member?.name || '알 수 없음'}
                                        <span className="admin-dot">·</span>
                                        {fmtDate(q.indate)}
                                    </div>
                                </div>
                                <div className="admin-arrow">
                                    {openNum === q.num ? '▲' : '▼'}
                                </div>
                            </div>

                            {openNum === q.num && (
                                <div className="admin-item-detail">
                                    <div className="admin-detail-label">문의 내용</div>
                                    <div className="admin-detail-box">
                                        <div className="admin-detail-text">{q.content}</div>
                                    </div>

                                    {status === 'wait' ? (
                                        <div className="admin-action-col">
                                            <textarea
                                                className="admin-textarea"
                                                value={input[q.num] || ''}
                                                onChange={(e) =>
                                                    setInput({ ...input, [q.num]: e.target.value })
                                                }
                                                placeholder="답변을 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="admin-submit-btn full"
                                                onClick={() => handleReply(q.num)}
                                            >
                                                답변 등록
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="admin-detail-label">답변</div>
                                            <div className="admin-answer-box">{q.reply}</div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Admin;