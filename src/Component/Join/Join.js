import React, { createContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { loginAction } from '../../store/userSlice';
import MyInfo from './MyInfo';

export const StepContext = createContext();

function Join({ mode = 'local' }) {
  const { num } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  // 카카오 추가정보 저장
  const submitKakaoInfo = async (data) => {
    try {
      const payload = {
        num: Number(num),
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        pass: data.pass,
        profileImg: data.profileImg,
      };

      const res = await axios.post(
        '/api/member/kakaoinfoUpdate',
        payload
      );

      if (res.data.msg === 'OK') {

        const user = res.data.loginUser
        const accessToken = res.data.accessToken
        const refreshToken = res.data.refreshToken
        const data = {
          ...user,
          accessToken,
          refreshToken,
        }
        cookies.set(
          'user',
          JSON.stringify(data),
          { path: '/' }
        );

        dispatch(loginAction(data));

        alert('회원가입이 완료되었습니다!');
        navigate('/');
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <StepContext.Provider
      value={{
        currentStep: 1,
        totalSteps: 1,
        mode,
      }}
    >
      <MyInfo
        onPrev={() => navigate('/login')}
        mode={mode}
        onSubmit={submitKakaoInfo}
      />
    </StepContext.Provider>
  );
}

export default Join;