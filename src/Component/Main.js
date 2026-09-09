import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../style/main.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jaxios from '../util/JWTUtil';
import { useSelector } from 'react-redux';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Main() {
    const loginUser = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [noticeList, setNoticeList] = useState([]);
    const sliderRef = useRef(null);

    // 식단 목표
    const [dietGoal, setDietGoal] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });

    // 체중 목표
    const [weightGoal, setWeightGoal] = useState({ targetWeight: 0, exerciseTime: 0, exerciseCalories: 0 });

    // 모달
    const [activeModal, setActiveModal] = useState(null);
    const [tempDiet, setTempDiet] = useState({ calories: '', carbs: '', protein: '', fat: '' });
    const [tempWeight, setTempWeight] = useState({ targetWeight: '', exerciseTime: '', exerciseCalories: '' });

    const getAuthConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
    }, []);

    // ==========================================
    // 목표 데이터 조회
    // ==========================================
    const fetchGoals = useCallback(async () => {
        const config = getAuthConfig();

        try {
            const [dietRes, weightRes] = await Promise.all([
                loginUser?.num
                    ? jaxios.get(`/api/foodgoal/getFoodGoal/${loginUser.num}`, config).catch(() => null)
                    : Promise.resolve(null),
                loginUser?.num
                    ? jaxios.get(`/api/exercisesgoal/getExercisesGoal/${loginUser.num}`, config).catch(() => null)
                    : Promise.resolve(null)
            ]);

            // 식단 목표
            const fg = dietRes && dietRes.data && dietRes.data.foodGoal;

            if (fg) {
                setDietGoal({ calories: fg.goalCalories, carbs: fg.goalCarbs, protein: fg.goalProtein, fat: fg.goalFat });
            } else {
                setDietGoal({ calories: 0, carbs: 0, protein: 0, fat: 0 });
            }

            // 체중 목표
            const wg = weightRes && weightRes.data && weightRes.data.goal;

            if (wg) {
                setWeightGoal({ targetWeight: wg.goalWeight, exerciseTime: wg.goalTime, exerciseCalories: wg.goalCalories });
            } else {
                setWeightGoal({ targetWeight: 0, exerciseTime: 0, exerciseCalories: 0 });
            }
        } catch (error) {
            console.error('목표 데이터 조회 중 오류 발생:', error);
        }
    }, [getAuthConfig, loginUser?.num]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // ==========================================
    // 식단 목표 저장
    // ==========================================
    const handleSaveDiet = async (e) => {
        e.preventDefault();

        const config = getAuthConfig();
        const payload = {
            goalCalories: tempDiet.calories,
            goalCarbs: tempDiet.carbs,
            goalProtein: tempDiet.protein,
            goalFat: tempDiet.fat,
            member: { num: loginUser?.num }
        };

        try {
            await jaxios.post('/api/foodgoal/goalSave', payload, config);
            alert('식단 목표가 저장되었습니다.');
            await fetchGoals();
            setActiveModal(null);
        } catch (error) {
            console.error('식단 목표 저장 실패:', error);
            alert('목표 저장 중 오류가 발생했습니다.');
        }
    };

    // ==========================================
    // 체중 목표 저장
    // ==========================================
    const handleSaveWeight = async (e) => {
        e.preventDefault();

        const config = getAuthConfig();
        const payload = {
            goalWeight: tempWeight.targetWeight,
            goalTime: tempWeight.exerciseTime,
            goalCalories: tempWeight.exerciseCalories,
            member: { num: loginUser?.num }
        };

        try {
            await jaxios.post('/api/exercisesgoal/insertExercisesGoal', payload, config);
            alert('체중 목표가 저장되었습니다.');
            await fetchGoals();
            setActiveModal(null);
        } catch (error) {
            console.error('체중 목표 저장 실패:', error);
            alert('목표 저장 중 오류가 발생했습니다.');
        }
    };

    // ==========================================
    // 공지사항 조회
    // ==========================================
    useEffect(() => {
        const fetchNoticeList = async () => {
            try {
                const response = await axios.get('/api/notice/getAllList');
                setNoticeList(response.data.list || []);
            } catch (error) {
                console.error('공지사항 조회 실패:', error);
            }
        };

        fetchNoticeList();
    }, []);

    // ==========================================
    // 공지사항 클릭
    // ==========================================
    const handleNoticeClick = (num) => {
        navigate(`/notice?num=${num}`);
    };

    // ==========================================
    // 렌더링
    // ==========================================
    return (
        <div className="main-container">

            {/* 공지사항 */}
            <div className="notice-banner">
                <div className="notice-banner-header">
                    <div className="notice-banner-header-title">
                        <span className="notice-icon">📢</span>
                        <span>공지사항</span>
                    </div>

                    <button type="button" className="notice-banner-more" onClick={() => navigate('/notice')}>
                        전체보기
                    </button>
                </div>

                <div className="notice-content-wrapper">
                    {noticeList.length > 0 ? (
                        <>
                            <Slider
                                ref={sliderRef}
                                dots={false}
                                arrows={false}
                                infinite={noticeList.length > 1}
                                speed={400}
                                slidesToShow={1}
                                slidesToScroll={1}
                                adaptiveHeight={true}
                            >
                                {noticeList.map((notice) => (
                                    <div key={notice.num} className="notice-slide-item">
                                        <div className="notice-banner-slide" onClick={() => handleNoticeClick(notice.num)}>
                                            {/* 제목 */}
                                            <div className="notice-banner-title">{notice.title}</div>

                                            {/* 작성일 */}
                                            <div className="notice-banner-date">
                                                {notice.indate ? new Date(notice.indate).toLocaleDateString('ko-KR') : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>

                            {noticeList.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className="notice-arrow notice-arrow-prev"
                                        onClick={() => sliderRef.current?.slickPrev()}
                                    >
                                        ‹
                                    </button>

                                    <button
                                        type="button"
                                        className="notice-arrow notice-arrow-next"
                                        onClick={() => sliderRef.current?.slickNext()}
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="notice-empty">등록된 공지사항이 없습니다.</div>
                    )}
                </div>
            </div>

            {/* 식단 / 체중 목표 */}
            <div className="goal-container">

                {/* 식단 목표 */}
                <div className="goal-card">
                    <div className="goal-card-header">
                        <h3>🥗 식단 목표</h3>
                        <button
                            type="button"
                            className="goal-edit-btn"
                            onClick={() => {
                                setTempDiet({ ...dietGoal });
                                setActiveModal('diet');
                            }}
                        >
                            설정
                        </button>
                    </div>

                    <div className="goal-card-body">
                        <div className="goal-main-value">
                            <span>목표 칼로리</span>
                            <strong>{dietGoal.calories ? `${dietGoal.calories} kcal` : '미설정'}</strong>
                        </div>

                        <div className="goal-sub-grid">
                            <div className="sub-item">
                                <span>탄수화물</span>
                                <strong>{dietGoal.carbs ? `${dietGoal.carbs}g` : '-'}</strong>
                            </div>
                            <div className="sub-item">
                                <span>단백질</span>
                                <strong>{dietGoal.protein ? `${dietGoal.protein}g` : '-'}</strong>
                            </div>
                            <div className="sub-item">
                                <span>지방</span>
                                <strong>{dietGoal.fat ? `${dietGoal.fat}g` : '-'}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 체중 목표 */}
                <div className="goal-card">
                    <div className="goal-card-header">
                        <h3>⚖️ 체중 목표</h3>
                        <button
                            type="button"
                            className="goal-edit-btn"
                            onClick={() => {
                                setTempWeight({ ...weightGoal });
                                setActiveModal('weight');
                            }}
                        >
                            설정
                        </button>
                    </div>

                    <div className="goal-card-body">
                        <div className="goal-main-value">
                            <span>목표 체중</span>
                            <strong>{weightGoal.targetWeight ? `${weightGoal.targetWeight} kg` : '미설정'}</strong>
                        </div>

                        <div className="goal-sub-grid">
                            <div className="sub-item">
                                <span>운동 시간</span>
                                <strong>{weightGoal.exerciseTime ? `${weightGoal.exerciseTime}분` : '-'}</strong>
                            </div>
                            <div className="sub-item">
                                <span>소모 칼로리</span>
                                <strong>{weightGoal.exerciseCalories ? `${weightGoal.exerciseCalories} kcal` : '-'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 식단 목표 설정 모달 */}
            {activeModal === 'diet' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>🥗 식단 목표 설정</h3>

                        <form onSubmit={handleSaveDiet}>
                            <label>
                                목표 칼로리 (kcal)
                                <input
                                    type="number"
                                    placeholder="예: 2000"
                                    value={tempDiet.calories}
                                    onChange={(e) => setTempDiet({ ...tempDiet, calories: Number(e.target.value) })}
                                    required
                                />
                            </label>

                            <label>
                                탄수화물 (g)
                                <input
                                    type="number"
                                    placeholder="예: 200"
                                    value={tempDiet.carbs}
                                    onChange={(e) => setTempDiet({ ...tempDiet, carbs: Number(e.target.value) })}
                                />
                            </label>

                            <label>
                                단백질 (g)
                                <input
                                    type="number"
                                    placeholder="예: 120"
                                    value={tempDiet.protein}
                                    onChange={(e) => setTempDiet({ ...tempDiet, protein: Number(e.target.value) })}
                                />
                            </label>

                            <label>
                                지방 (g)
                                <input
                                    type="number"
                                    placeholder="예: 50"
                                    value={tempDiet.fat}
                                    onChange={(e) => setTempDiet({ ...tempDiet, fat: Number(e.target.value) })}
                                />
                            </label>

                            <div className="modal-btn-group">
                                <button type="button" onClick={() => setActiveModal(null)}>취소</button>
                                <button type="submit" className="save-btn">저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 체중 목표 설정 모달 */}
            {activeModal === 'weight' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>⚖️ 체중 목표 설정</h3>

                        <form onSubmit={handleSaveWeight}>
                            <label>
                                목표 체중 (kg)
                                <input
                                    type="number"
                                    placeholder="예: 65"
                                    value={tempWeight.targetWeight}
                                    onChange={(e) => setTempWeight({ ...tempWeight, targetWeight: Number(e.target.value) })}
                                    required
                                />
                            </label>

                            <label>
                                목표 운동 시간 (분)
                                <input
                                    type="number"
                                    placeholder="예: 60"
                                    value={tempWeight.exerciseTime}
                                    onChange={(e) => setTempWeight({ ...tempWeight, exerciseTime: Number(e.target.value) })}
                                />
                            </label>

                            <label>
                                목표 소모 칼로리 (kcal)
                                <input
                                    type="number"
                                    placeholder="예: 400"
                                    value={tempWeight.exerciseCalories}
                                    onChange={(e) => setTempWeight({ ...tempWeight, exerciseCalories: Number(e.target.value) })}
                                />
                            </label>

                            <div className="modal-btn-group">
                                <button type="button" onClick={() => setActiveModal(null)}>취소</button>
                                <button type="submit" className="save-btn">저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 카테고리 */}
            <div className="category">
                <div onClick={() => navigate('/Meal')}>식사기록</div>
                <div onClick={() => navigate('/Weight')}>체중기록</div>
                <div onClick={() => navigate('/Exercise')}>운동기록</div>
            </div>

        </div>
    );
}

export default Main;