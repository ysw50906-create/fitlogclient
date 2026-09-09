import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { loginAction } from '../store/userSlice';

function KakaoLogin() {
    const { num } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();

    useEffect(() => {
        const login = async () => {
            try {
                const res = await axios.get(
                    `/api/member/getMemberByNum?num=${num}`
                );

                const loginUser = res.data.loginUser;
                const accessToken = res.data.accessToken
                const refreshToken = res.data.refreshToken
                const data = {
                    ...loginUser,
                    accessToken,
                    refreshToken
                }

                if (!loginUser) {
                    alert('회원 정보를 찾을 수 없습니다.');
                    navigate('/login');
                    return;
                }

                cookies.set(
                    'user',
                    JSON.stringify(data),
                    { path: '/' }
                );

                dispatch(loginAction(data));
                navigate('/');
            } catch (err) {
                console.error(err);
                alert('카카오 로그인에 실패했습니다.');
                navigate('/login');
            }
        };

        login();
    }, [num, navigate, dispatch]);

    return <div>카카오 로그인 중...</div>;
}

export default KakaoLogin;