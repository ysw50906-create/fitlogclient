import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import jaxios from '../util/JWTUtil';
import { loginAction, logoutAction } from '../store/userSlice';
import '../style/MyPage.css';

// 프로필 이미지 경로 생성 (카카오는 전체 URL, 로컬은 서버 경로)
const toImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `/api/image/member/${encodeURIComponent(img)}`;
};

function MyPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const loginUser = useSelector((state) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    // 수정용 입력 상태
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [zipNum, setZipNum] = useState('');
    const [add1, setAdd1] = useState('');
    const [add2, setAdd2] = useState('');
    const [add3, setAdd3] = useState('');

    const [profileImg, setProfileImg] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imgError, setImgError] = useState(false);

    // 구독 만료일 (yyyy-MM-dd)
    const [subEnd, setSubEnd] = useState(null);


    // 전화번호 하이픈(-) 자동 생성
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

    // loginUser 가 쿠키에서 복원된 뒤에 상태 채우기
    useEffect(() => {
        if (!loginUser || !loginUser.id) return;
        resetForm();
    }, [loginUser]);

    // 구독 정보 조회
    useEffect(() => {
        if (!loginUser?.num) return;

        async function fetchSubscription() {
            try {
                const res = await jaxios.get(`/api/charge/getSubscription?mnum=${loginUser.num}`);
                setSubEnd(res.data.subEnd || null);
            } catch (err) {
                console.error('구독 정보 조회 실패:', err);
                setSubEnd(null);
            }
        }
        fetchSubscription();
    }, [loginUser?.num]);

    // 만료일까지 남은 일수 (오늘 자정 기준)
    function getRemainDays() {
        if (!subEnd) return null;
        const end = new Date(`${subEnd}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.round((end - today) / (1000 * 60 * 60 * 24));
    }

    const remainDays = getRemainDays();

    function resetForm() {
        setName(loginUser.name || '');
        setPhone(loginUser.phone || '');
        setEmail(loginUser.email || '');
        setHeight(loginUser.height || '');
        setWeight(loginUser.weight || '');
        setZipNum(loginUser.zipNum || '');
        setAdd1(loginUser.add1 || '');
        setAdd2(loginUser.add2 || '');
        setAdd3(loginUser.add3 || '');
        setProfileImg(loginUser.profileImg || null);
        setPreview(toImageUrl(loginUser.profileImg));
        setImgError(false);
    }

    // 주소 표시 문자열
    function addressText() {
        if (!loginUser.add1) return '등록된 주소가 없습니다';
        const zip = loginUser.zipNum ? `[${loginUser.zipNum}] ` : '';
        return `${zip}${loginUser.add1} ${loginUser.add2 || ''}`.trim();
    }

    const handleImageClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
            setImgError(false);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await jaxios.post(`/api/member/fileupload`, formData);
            setProfileImg(res.data.filename);
        } catch (err) {
            console.error(err);
            alert('이미지 업로드에 실패했습니다.');
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleSaveClick = async () => {
        if (!name) return alert('닉네임을 입력해주세요.');
        if (!phone) return alert('핸드폰 번호를 입력해주세요.');
        if (!email) return alert('이메일을 입력해주세요.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('이메일 형식을 확인해주세요.');

        const member = {
            ...loginUser,
            num: loginUser.num,
            id: loginUser.id,
            name,
            phone,
            email,
            profileImg,
        };

        try {
            const res = await jaxios.post(`/api/member/updateMember`, member);
            if (res.data.msg === 'OK') {
                cookies.set('user', JSON.stringify(member), { path: '/' });
                dispatch(loginAction(member));
                setPreview(toImageUrl(profileImg));
                setImgError(false);
                setIsEditing(false);
                alert('수정되었습니다');
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 연결에 실패했습니다.');
        }
    };

    const handleLogout = () => {
        if (!window.confirm('로그아웃 하시겠습니까?')) return;
        cookies.remove('user', { path: '/' });
        dispatch(logoutAction());
        navigate('/');
    };

    const handleWithdraw = async () => {
        if (!window.confirm('정말 탈퇴하시겠습니까? 되돌릴 수 없습니다.')) return;

        try {
            const res = await jaxios.delete(`/api/member/deleteMember`, {
                params: { id: loginUser.id },
            });
            if (res.data.msg === 'OK') {
                cookies.remove('user', { path: '/' });
                dispatch(logoutAction());
                alert('탈퇴 처리되었습니다.');
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            alert('탈퇴 처리에 실패했습니다.');
        }
    };

    return (
        <div className="mypage-container">
            {/* 프로필 */}
            <div className="mypage-profile-card">
                <div
                    className={`mypage-avatar ${isEditing ? 'editable' : ''}`}
                    onClick={handleImageClick}
                >
                    {preview && !imgError ? (
                        <img
                            src={preview}
                            alt="profile"
                            className="mypage-avatar-img"
                            onError={() => {
                                console.warn('프로필 이미지 로드 실패:', preview);
                                setImgError(true);
                            }}
                        />
                    ) : (
                        <div className="mypage-avatar-placeholder">👤</div>
                    )}
                    {isEditing && <div className="mypage-camera-btn">📷</div>}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {isEditing ? (
                    <input
                        type="text"
                        className="mypage-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="닉네임"
                    />
                ) : (
                    <div className="mypage-name">{loginUser.name}</div>
                )}
                <div className="mypage-id">@{loginUser.id}</div>

                {isEditing ? (
                    <input
                        type="text"
                        className="mypage-phone-input"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="전화번호 (010-0000-0000)"
                    />
                ) : (
                    <div className="mypage-phone">{loginUser.phone}</div>
                )}

                {isEditing ? (
                    <input
                        type="email"
                        className="mypage-email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 (abc@example.com)"
                    />
                ) : (
                    <div className="mypage-email">{loginUser.email || '등록된 이메일이 없습니다'}</div>
                )}
            </div>


            {/* 버튼 */}
            {isEditing ? (
                <div className="mypage-btn-row">
                    <div className="mypage-cancel-btn" onClick={handleCancelClick}>
                        취소
                    </div>
                    <div className="mypage-save-btn" onClick={handleSaveClick}>
                        저장
                    </div>
                </div>
            ) : (
                <div className="mypage-edit-btn" onClick={handleEditClick}>
                    정보 수정
                </div>
            )}
            {/* 구독 상태 */}
            <div className="mypage-sub-card">
                <div className="mypage-sub-label">구독 남은 기간</div>

                {remainDays === null ? (
                    <div className="mypage-sub-empty">구독 정보가 없습니다</div>
                ) : remainDays > 0 ? (
                    <>
                        <div className="mypage-sub-value">{remainDays}일</div>
                        <div className="mypage-sub-date">{subEnd} 까지</div>
                    </>
                ) : (
                    <>
                        <div className="mypage-sub-value expired">만료됨</div>
                        <div className="mypage-sub-date">{subEnd} 종료</div>
                    </>
                )}
            </div>

            {/* 구독/결제 관리 */}
            <div className="mypage-account-menu">
                <div className="mypage-account-item" onClick={() => navigate('/payment')}>
                    정기구독
                </div>
                <div className="mypage-account-item" onClick={() => navigate('/payHistory')}>
                    결제내역
                </div>
            </div>
            {/* 계정 관리 */}
            <div className="mypage-account-menu">
                <div className="mypage-account-item" onClick={() => navigate('/companyinfo')}>
                    회사정보
                </div>
                <div className="mypage-account-item" onClick={handleLogout}>
                    로그아웃
                </div>
                <div
                    className="mypage-account-item withdraw"
                    onClick={handleWithdraw}
                >
                    회원 탈퇴
                </div>
            </div>
        </div>
    );
}

export default MyPage;