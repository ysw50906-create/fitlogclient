import { Routes, Route, useLocation } from 'react-router-dom';
import Join from './Component/Join/Join';
import Login from './Component/Login';
import ExerciseLog from './Component/ExerciseLog';
import Head from './Component/Head';
import Foot from './Component/Foot';
import Meal from './Component/Meal';
import Main from './Component/Main'
import CompanyInfo from './Component/CompanyInfo'
import Weight from './Component/Weight'
import Notice from './Component/Notice'
import Community from './Component/Community/Community';
import MyPage from './Component/MyPage';
import Qna from './Component/qna/Qna'
import KakaoLogin from './Component/KakaoLogin';
import Stats from './Component/Stats'
import Admin from './Component/Admin'
import FindAccount from './Component/Findaccount';
import FollowPage from './Component/Community/FollowPage';
import Chat from './Component/Chat/Chat';
import Payment from './Component/Payment';
import PayHistory from './Component/PayHistory';
import Paypop from './Component/Paypop'
import PaymentSuccess from './Component/PaymentSuccess'



import './App.css';
import { useState } from 'react';

const HIDE_HEADER_FOOTER_PATHS = ['/login', '/join', '/savekakaoinfo', '/findaccount', '/paypop', '/payment'];

const NO_BACKGROUND_PATHS = ['/login', '/join', '/savekakaoinfo', '/findaccount', '/paypop'];

const HIDE_CHAT = ['/login', '/join', '/savekakaoinfo', '/findaccount']




function App() {
    const location = useLocation();

    const shouldHideHeaderFooter = HIDE_HEADER_FOOTER_PATHS.some((path) =>
        location.pathname.startsWith(path)
    );
    const shouldHideBackground = NO_BACKGROUND_PATHS.some((path) =>
        location.pathname.startsWith(path)
    );
    const shouldHideChat = HIDE_CHAT.some((path) =>
        location.pathname.startsWith(path)
    );

    const [activate, setActivate] = useState(false);

    return (
        <div className={`App ${shouldHideBackground ? 'App--no-bg' : ''}`}>
            {!shouldHideHeaderFooter && <Head setActivate={setActivate} />}
            <div className="App-content">
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path="/join" element={<Join />} />
                    <Route path="/savekakaoinfo/:num" element={<Join mode="kakao" />} />
                    <Route path="/kakaologin/:num" element={<KakaoLogin />} />
                    <Route path="/login" element={<Login setActivate={setActivate} />} />
                    <Route path="/exercise" element={<ExerciseLog />} />
                    <Route path="/weight" element={<Weight />} />
                    <Route path="/meal" element={<Meal />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/qna" element={<Qna />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/findaccount" element={<FindAccount />} />
                    <Route path="/follow" element={<FollowPage />} />
                    <Route path="/companyinfo" element={<CompanyInfo />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payHistory" element={<PayHistory />} />

                    <Route path='/paypop/:orderName/:amount' element={<Paypop />} />
                    <Route path='/payment/success' element={<PaymentSuccess />} />
                    <Route path='/payment/fail' element={<PaymentSuccess />} />


                </Routes>
            </div>
            {!shouldHideHeaderFooter && <Foot setActivate={setActivate} />}
            {!shouldHideChat && <Chat activate={activate} setActivate={setActivate} />}
        </div>
    );
}

export default App;