import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StepContext } from './Join';
import '../../style/Join/MyInfo.css';

function MyInfo({ joinData, onPrev, mode = 'local', onSubmit, isSaving = false }) {
    const { currentStep, totalSteps } = useContext(StepContext);
    const navigate = useNavigate();

    const isKakao = mode === 'kakao';

    const [profileImg, setProfileImg] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [phoneMessage, setPhoneMessage] = useState('');
    const [phoneMessageType, setPhoneMessageType] = useState(''); // 'success' | 'error'

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [passConfirm, setPassConfirm] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [phoneConfirmed, setPhoneConfirmed] = useState(false);
    const [userNumber, setUserNumber] = useState('');

    const [isIdChecked, setIsIdChecked] = useState(false);
    const [idCheckMessage, setIdCheckMessage] = useState('');
    const [formError, setFormError] = useState('');

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/api/member/fileupload', formData);
            setProfileImg(res.data.filename);
        } catch (err) {
            console.error(err);
            setFormError('이미지 업로드에 실패했습니다.');
        }
    };

    const handleIdChange = (e) => {
        setId(e.target.value);
        setIsIdChecked(false);
        setIdCheckMessage('');
    };

    const handleDuplicateCheck = async () => {
        if (!id) {
            setIsIdChecked(false);
            setIdCheckMessage('아이디를 입력해주세요.');
            return;
        }

        const params = new URLSearchParams();
        params.append('id', id);

        try {
            const res = await axios.post('/api/member/idcheck', params);
            if (res.data.msg === 'OK') {
                setIsIdChecked(true);
                setIdCheckMessage('사용 가능한 아이디입니다.');
            } else {
                setIsIdChecked(false);
                setIdCheckMessage('이미 사용중인 아이디입니다.');
            }
        } catch (err) {
            console.error(err);
            setIsIdChecked(false);
            setIdCheckMessage('중복확인 중 오류가 발생했습니다.');
        }
    };

    const handlePhoneChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length <= 3) {
            formatted = raw;
        } else if (raw.length <= 7) {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        } else {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        }
        setPhone(formatted);
    };

    const sendSMS = async () => {
        document.getElementById('smsBtn').disabled = true;
        try {
            const res = await axios.post('/api/member/sendSMS', null, { params: { phone } });
            if (res.data.msg === 'ok') {
                setPhoneMessage('SMS 인증 문자가 전송되었습니다. 5분 안에 입력해주세요.');
                setPhoneMessageType('success');
            } else {
                setPhoneMessage('문자 전송에 실패했습니다.');
                setPhoneMessageType('error');
            }
            document.getElementById('smsBtn').disabled = false;
        } catch (err) {
            console.error(err);
            setPhoneMessage('문자 전송 중 오류가 발생했습니다.');
            setPhoneMessageType('error');
            document.getElementById('smsBtn').disabled = false;
        }
    };

    const confirmSMSCode = () => {
        axios.post('/api/member/confirmSMSCode', null, { params: { userNumber, phone } })
            .then((res) => {
                if (res.data.msg === 'ok') {
                    setPhoneConfirmed(true);
                    setPhoneMessage('');
                } else {
                    setPhoneMessage('인증번호가 올바르지 않습니다.');
                    setPhoneMessageType('error');
                }
            }).catch(err => console.error(err));
    };

    const handleNextClick = async () => {
        if (isSaving) return;

        if (!name) return setFormError('닉네임을 입력해주세요.');

        if (!isKakao) {
            if (!id) return setFormError('아이디를 입력해주세요.');
            if (!isIdChecked) return setFormError('아이디 중복확인을 해주세요.');
            if (!pass) return setFormError('비밀번호를 입력해주세요.');
            if (!passConfirm) return setFormError('비밀번호 확인을 입력해주세요.');
            if (pass !== passConfirm) return setFormError('비밀번호가 일치하지 않습니다.');
        }

        if (!phone) return setFormError('핸드폰 번호를 입력해주세요.');
        if (!phoneConfirmed) return setFormError('핸드폰 인증을 완료해주세요.');
        if (!email || !email.trim()) return setFormError('이메일을 입력해주세요.');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return setFormError('올바른 이메일 형식을 입력해주세요.');

        setFormError('');

        if (isKakao) {
            onSubmit({ id, name, pass, phone, email, profileImg });
            return;
        }

        const member = { id, pass, name, phone, email, profileImg };

        try {
            const res = await axios.post('/api/member/join', member);
            if (res.data.msg === 'OK') {
                alert('회원가입이 완료되었습니다.');
                navigate('/login');
            } else {
                setFormError('회원가입에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            setFormError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="myinfo-container">
            <div className="myinfo-header">
                <div className="myinfo-back-btn" onClick={onPrev}>&larr;</div>
                <div className="myinfo-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`myinfo-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="myinfo-content">
                <div className="myinfo-section-title">내 정보</div>

                <div className="myinfo-avatar-wrapper">
                    <div className="myinfo-avatar">
                        {preview ? (
                            <img src={preview} alt="profile" className="myinfo-avatar-img" />
                        ) : (
                            <div className="myinfo-avatar-placeholder" />
                        )}
                        <div className="myinfo-camera-btn" onClick={handleImageClick}>📷</div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="myinfo-form">
                    <div className="myinfo-field">
                        <label className="myinfo-field-label">닉네임</label>
                        <input
                            type="text"
                            className="myinfo-input"
                            placeholder="닉네임을 입력해주세요."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">아이디</label>
                        <div className="myinfo-input-group">
                            <input
                                type="text"
                                className="myinfo-input"
                                placeholder="아이디를 입력해주세요."
                                value={id}
                                onChange={handleIdChange}
                            />
                            <button type="button" className="myinfo-check-btn" onClick={handleDuplicateCheck}>
                                중복확인
                            </button>
                        </div>
                    </div>
                    {idCheckMessage && (
                        <div className={`myinfo-check-message ${isIdChecked ? 'success' : 'error'}`}>
                            {idCheckMessage}
                        </div>
                    )}

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">비밀번호</label>
                        <input
                            type="password"
                            className="myinfo-input"
                            placeholder="비밀번호를 입력해주세요."
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                    </div>

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">비밀번호 확인</label>
                        <input
                            type="password"
                            className="myinfo-input"
                            placeholder="비밀번호를 다시 입력해주세요."
                            value={passConfirm}
                            onChange={(e) => setPassConfirm(e.target.value)}
                        />
                    </div>
                    {passConfirm.length > 0 && pass !== passConfirm && (
                        <div className="myinfo-check-message error">비밀번호가 일치하지 않습니다.</div>
                    )}

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">핸드폰 번호</label>
                        <input
                            type="tel"
                            className="myinfo-input"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                        />
                        <button type="button" className="myinfo-check-btn" onClick={sendSMS} id="smsBtn">
                            문자인증
                        </button>
                    </div>

                    {/* 문자 전송 메시지 */}
                    {phoneMessage && !phoneConfirmed && (
                        <div className={`myinfo-check-message ${phoneMessageType}`}>
                            {phoneMessage}
                        </div>
                    )}

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">인증번호</label>
                        <input
                            type="tel"
                            className="myinfo-input"
                            placeholder="인증번호를 입력해주세요."
                            value={userNumber}
                            onChange={(e) => setUserNumber(e.target.value)}
                            disabled={phoneConfirmed}
                        />
                        <button
                            type="button"
                            className="myinfo-check-btn"
                            onClick={phoneConfirmed ? undefined : confirmSMSCode}
                            disabled={phoneConfirmed}
                            style={{
                                opacity: phoneConfirmed ? 0.6 : 1,
                                cursor: phoneConfirmed ? 'not-allowed' : 'pointer',
                                pointerEvents: phoneConfirmed ? 'none' : 'auto',
                            }}
                        >
                            {phoneConfirmed ? '인증완료' : '인증'}
                        </button>
                    </div>
                    {phoneConfirmed && (
                        <div className="myinfo-check-message success">SMS 인증이 완료되었습니다.</div>
                    )}

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">이메일</label>
                        <input
                            type="text"
                            className="myinfo-input"
                            placeholder="이메일을 입력해주세요."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {formError && <div className="myinfo-form-error">{formError}</div>}
            </div>

            <div
                className={`myinfo-next-btn ${isSaving ? 'loading' : ''}`}
                onClick={handleNextClick}
            >
                {isSaving ? '저장 중...' : '가입 완료'}
            </div>
        </div>
    );
}

export default MyInfo;