import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loginAction } from '../store/userSlice'
import { Cookies } from 'react-cookie'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../style/Login.css'

function Login({ setActivate }) {
    const [id, setId] = useState('')
    const [pass, setPass] = useState('')
    const cookies = new Cookies()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const loginUser = useSelector(state => state.user)

    useEffect(
        () => {
            if (loginUser && loginUser.id) {
                alert('현재 로그인 상태입니다. 로그아웃후에 사용하세요')
                return navigate('/')
            }
        }, []
    )

    function loginLocal() {
        if (!id) { return alert('아이디를 입력하세요') }
        if (!pass) { return alert('패스워드를 입력하세요') }
        axios.post('/api/member/loginLocal', null, { params: { username: id, password: pass } })
            .then((result) => {
                if (result.data.id){
                    cookies.set('user', JSON.stringify(result.data), { path: '/' })
                    dispatch(loginAction(result.data));
                    alert(`${result.data.name}님, 환영합니다!`)
                    setActivate(false)
                    navigate('/')
                } else{
                    alert('아이디, 비밀번호를 확인하세요')
                    setPass('')
                }
            })
            .catch((err) => { console.error(err) })
    }

    return (
        <div className="login-page">
            {/* 로고 → 메인으로 */}
            <div className="login-logo" onClick={() => navigate('/')}>
                <img
                    src="/img/fitlog-logo.png"
                    alt="FITLOG"
                    className="login-logo-img"
                />
            </div>

            <div className="login-container">
                <div className="login-content">
                    <div className="login-title">로그인</div>

                    <div className="login-field">
                        <label className="login-field-label">아이디</label>
                        <input
                            type="text"
                            className="login-input"
                            placeholder="아이디를 입력해주세요"
                            value={id}
                            onChange={(e) => { setId(e.currentTarget.value) }}
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-field-label">비밀번호</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="비밀번호를 입력해주세요"
                            value={pass}
                            onChange={(e) => { setPass(e.currentTarget.value) }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') { loginLocal() }
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className="login-btn"
                        onClick={() => { loginLocal() }}
                    >
                        로그인
                    </button>

                    <button
                        type="button"
                        className="kakao-login-btn"
                        onClick={() => { window.location.href = '/api/member/kakaostart' }}
                    >
                        카카오 로그인
                    </button>

                    <div className="login-bottom-menu">
                        <span
                            className="login-find-link"
                            onClick={() => navigate('/findaccount')}
                        >
                            아이디/비밀번호 찾기
                        </span>
                        <span className="login-find-divider">|</span>
                        <span
                            className="login-find-link"
                            onClick={() => navigate('/join')}
                        >
                            회원가입
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login