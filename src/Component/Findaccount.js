import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../style/Findaccount.css'

function FindAccount() {
    const navigate = useNavigate()

    const [tab, setTab] = useState('id')

    // ===== 아이디 찾기 =====
    const [idName, setIdName] = useState('')
    const [idPhone, setIdPhone] = useState('')
    const [foundId, setFoundId] = useState(null)

    // ===== 비밀번호 찾기 =====
    const [passStep, setPassStep] = useState(1)
    const [pId, setPId] = useState('')
    const [pEmail, setPEmail] = useState('')
    const [emailSended, setEmailSended] = useState(false)
    const [emailConfirmed, setEmailConfirmed] = useState(false)
    const [emailMessage, setEmailMessage] = useState('')
    const [emailMessageType, setEmailMessageType] = useState('')
    const [userNumber, setUserNumber] = useState('')
    const [newPass, setNewPass] = useState('')
    const [newPass2, setNewPass2] = useState('')

    const handlePhoneChange = (setter) => (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length <= 3) {
            formatted = raw;
        } else if (raw.length <= 7) {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        } else {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        }
        setter(formatted);
    };

    function changeTab(next) {
        setTab(next)
        setFoundId(null)
        setPassStep(1)
        setNewPass('')
        setNewPass2('')
        setEmailSended(false)
        setEmailConfirmed(false)
        setEmailMessage('')
        setEmailMessageType('')
        setUserNumber('')
    }

    function findId() {
        if (!idName) { return alert('이름을 입력하세요.') }
        if (!idPhone) { return alert('전화번호를 입력하세요.') }

        axios.get(`/api/member/findId`, { params: { name: idName, phone: idPhone } })
            .then((result) => {
                setFoundId(result.data.id ? result.data.id : '')
            })
            .catch((err) => { console.error(err) })
    }

    async function sendEmail() {
        if (!pId) { return alert('아이디를 입력하세요.') }
        if (!pEmail) { return alert('이메일 주소를 입력하세요.') }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(pEmail.trim())) return alert('올바른 이메일 형식을 입력해주세요.');

        document.getElementById('emailBtn').disabled = true;
        try {
            const res = await axios.post('/api/member/sendEmail', null, { params: { email: pEmail, id: pId } })
            if (res.data.msg === 'ok') {
                setEmailSended(true)
                setEmailMessage('인증 메일을 보냈습니다. 5분 안에 입력해주세요.')
                setEmailMessageType('success')
            } else {
                setEmailMessage(res.data.msg)
                setEmailMessageType('error')
            }
            document.getElementById('emailBtn').disabled = false;
        } catch (err) {
            console.error(err)
            setEmailMessage('이메일 전송 중 오류가 발생했습니다.')
            setEmailMessageType('error')
            document.getElementById('emailBtn').disabled = false;
        }
    }

    async function confirmEmail() {
        if (!userNumber) { return alert('인증번호를 입력하세요.') }

        document.getElementById('confirmBtn').disabled = true;
        try {
            const res = await axios.post('/api/member/confirmEmailCode', null, { params: { userNumber, email: pEmail } })
            if (res.data.msg === 'ok') {
                setEmailConfirmed(true)
                setEmailMessage('인증 완료되었습니다.')
                setEmailMessageType('success')
                setTimeout(() => setPassStep(2), 800)
            } else {
                setEmailMessage('인증번호가 올바르지 않습니다.')
                setEmailMessageType('error')
                document.getElementById('confirmBtn').disabled = false;
            }
        } catch (err) {
            console.error(err)
            setEmailMessage('인증 확인 중 오류가 발생했습니다.')
            setEmailMessageType('error')
            document.getElementById('confirmBtn').disabled = false;
        }
    }

    function resetPass() {
        if (!newPass) { return alert('새 비밀번호를 입력하세요.') }
        if (newPass.length < 4) { return alert('비밀번호는 4자 이상 입력하세요.') }
        if (newPass !== newPass2) { return alert('비밀번호가 일치하지 않습니다.') }

        axios.post(`/api/member/resetPass`, { id: pId, pass: newPass })
            .then((result) => {
                if (result.data.success) {
                    alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
                    navigate('/login')
                } else {
                    alert(result.data.msg)
                }
            })
            .catch((err) => { console.error(err) })
    }

    return (
        <div className="fa-container">
            <div className="fa-content">
                <div className="fa-title">아이디/비밀번호 찾기</div>

                <div className="fa-tabs">
                    <button
                        type="button"
                        className={tab === 'id' ? 'fa-tab fa-tab-on' : 'fa-tab'}
                        onClick={() => changeTab('id')}
                    >
                        아이디 찾기
                    </button>
                    <button
                        type="button"
                        className={tab === 'pass' ? 'fa-tab fa-tab-on' : 'fa-tab'}
                        onClick={() => changeTab('pass')}
                    >
                        비밀번호 찾기
                    </button>
                </div>

                {/* ================= 아이디 찾기 ================= */}
                {tab === 'id' && (
                    <>
                        {foundId === null ? (
                            <>
                                <div className="fa-field">
                                    <label className="fa-label">이름</label>
                                    <input
                                        type="text"
                                        className="fa-input"
                                        placeholder="가입할 때 입력한 이름"
                                        value={idName}
                                        onChange={(e) => { setIdName(e.currentTarget.value) }}
                                    />
                                </div>
                                <div className="fa-field">
                                    <label className="fa-label">전화번호</label>
                                    <input
                                        type="text"
                                        className="fa-input"
                                        placeholder="010-0000-0000"
                                        value={idPhone}
                                        onChange={handlePhoneChange(setIdPhone)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { findId() } }}
                                    />
                                </div>
                                <button type="button" className="fa-btn" onClick={() => { findId() }}>
                                    아이디 찾기
                                </button>
                            </>
                        ) : foundId ? (
                            <div className="fa-result">
                                <div className="fa-result-label">회원님의 아이디입니다.</div>
                                <div className="fa-result-value">{foundId}</div>
                                <button type="button" className="fa-btn" onClick={() => navigate('/login')}>
                                    로그인하기
                                </button>
                                <button
                                    type="button"
                                    className="fa-btn fa-btn-sub"
                                    onClick={() => changeTab('pass')}
                                >
                                    비밀번호 찾기
                                </button>
                            </div>
                        ) : (
                            <div className="fa-result">
                                <div className="fa-result-empty">
                                    일치하는 회원 정보가 없습니다.
                                </div>
                                <button
                                    type="button"
                                    className="fa-btn"
                                    onClick={() => setFoundId(null)}
                                >
                                    다시 입력하기
                                </button>
                                <button
                                    type="button"
                                    className="fa-btn fa-btn-sub"
                                    onClick={() => navigate('/join')}
                                >
                                    회원가입
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ================= 비밀번호 찾기 ================= */}
                {tab === 'pass' && (
                    <>
                        {passStep === 1 ? (
                            <>
                                <div className="fa-field">
                                    <label className="fa-label">아이디</label>
                                    <input
                                        type="text"
                                        className="fa-input"
                                        placeholder="아이디를 입력해주세요."
                                        value={pId}
                                        onChange={(e) => { setPId(e.currentTarget.value) }}
                                        disabled={emailSended}
                                    />
                                </div>

                                <div className="fa-field">
                                    <label className="fa-label">이메일</label>
                                    <input
                                        type="text"
                                        className="fa-input"
                                        placeholder="이메일을 입력해주세요."
                                        value={pEmail}
                                        onChange={(e) => {
                                            setPEmail(e.currentTarget.value)
                                            setEmailSended(false)
                                            setEmailConfirmed(false)
                                            setEmailMessage('')
                                        }}
                                        disabled={emailConfirmed}
                                    />
                                    <button
                                        type="button"
                                        className="fa-btn-inline"
                                        id="emailBtn"
                                        onClick={sendEmail}
                                        disabled={emailConfirmed}
                                        style={{
                                            opacity: emailConfirmed ? 0.6 : 1,
                                            cursor: emailConfirmed ? 'not-allowed' : 'pointer',
                                            pointerEvents: emailConfirmed ? 'none' : 'auto',
                                        }}
                                    >
                                        {emailSended ? '재전송' : '인증전송'}
                                    </button>
                                </div>

                                {/* 이메일 전송/인증 메시지 */}
                                {emailMessage && (
                                    <div className={`fa-check-message ${emailMessageType}`}>
                                        {emailMessage}
                                    </div>
                                )}

                                {/* 인증번호 입력 — 전송 후 노출 */}
                                {emailSended && !emailConfirmed && (
                                    <div className="fa-field">
                                        <label className="fa-label">인증번호</label>
                                        <input
                                            type="text"
                                            className="fa-input"
                                            placeholder="인증번호를 입력해주세요."
                                            value={userNumber}
                                            onChange={(e) => { setUserNumber(e.currentTarget.value) }}
                                        />
                                        <button
                                            type="button"
                                            className="fa-btn-inline"
                                            id="confirmBtn"
                                            onClick={confirmEmail}
                                        >
                                            인증확인
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="fa-step-msg">
                                    <b>{pId}</b> 님, 새 비밀번호를 입력해주세요.
                                </div>

                                <div className="fa-field">
                                    <label className="fa-label">새 비밀번호</label>
                                    <input
                                        type="password"
                                        className="fa-input"
                                        placeholder="새 비밀번호."
                                        value={newPass}
                                        onChange={(e) => { setNewPass(e.currentTarget.value) }}
                                    />
                                </div>

                                <div className="fa-field">
                                    <label className="fa-label">새 비밀번호 확인</label>
                                    <input
                                        type="password"
                                        className="fa-input"
                                        placeholder="한 번 더 입력해주세요."
                                        value={newPass2}
                                        onChange={(e) => { setNewPass2(e.currentTarget.value) }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { resetPass() } }}
                                    />
                                    {newPass2 && newPass !== newPass2 && (
                                        <div className="fa-warn">비밀번호가 일치하지 않습니다.</div>
                                    )}
                                </div>

                                <button type="button" className="fa-btn" onClick={() => { resetPass() }}>
                                    비밀번호 변경
                                </button>
                            </>
                        )}
                    </>
                )}

                <div className="fa-bottom">
                    <span className="fa-link" onClick={() => navigate('/login')}>로그인</span>
                    <span className="fa-divider">|</span>
                    <span className="fa-link" onClick={() => navigate('/join')}>회원가입</span>
                </div>
            </div>
        </div>
    )
}

export default FindAccount