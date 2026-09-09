import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jaxios from '../util/JWTUtil';
import '../style/stats.css';

import { Chart, Line, Bar } from 'react-chartjs-2';


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler
);
// ---------------------------------------------------------------
// 공통 유틸
// ---------------------------------------------------------------
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// 주어진 날짜가 속한 주(일~토)의 시작일(일요일)을 반환
const getWeekStart = (baseDate, weekOffset) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getWeekDates = (weekStart) =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

const toYmdString = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const weekRangeLabel = (weekDates) => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getMonth() + 1}.${start.getDate()} ~ ${end.getMonth() + 1}.${end.getDate()}`;
};

const chartLabel = (date) => `${weekdays[date.getDay()]}`;

const baseChartOptions = (tooltipUnit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) =>
                    context.raw !== null && context.raw !== undefined
                        ? `${context.raw}${tooltipUnit}`
                        : '기록 없음'
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#888888', font: { size: 12 } }
        },
        y: {
            grid: { color: '#f0f0f0' },
            ticks: { color: '#888888', font: { size: 12 } }
        }
    }
});

// 주간 이동 네비게이션 (모든 섹션 공통 UI)
function WeekNav({ weekDates, weekOffset, setWeekOffset }) {
    return (
        <div className="stats-week-nav">
            <button
                type="button"
                className="stats-week-btn"
                onClick={() => setWeekOffset((prev) => prev - 1)}
            >
                ‹
            </button>
            <div className="stats-week-range">{weekRangeLabel(weekDates)}</div>
            <button
                type="button"
                className="stats-week-btn"
                onClick={() => setWeekOffset((prev) => prev + 1)}
            >
                ›
            </button>
        </div>
    );
}

// ---------------------------------------------------------------
// 1. 체중 통계 (기존 Weight2.js의 주간 라인차트 로직 재사용)
// ---------------------------------------------------------------
function WeightStatsSection() {
    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [weightGoal, setWeightGoal] = useState(null); // 목표 체중

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get(`/api/weightlog/getWeightLog/${loginUser.num}`);
            const logs = res.data?.weightLog || [];

            // 서버 응답의 weightGoal 반영
            setWeightGoal(res.data?.weightGoal ?? null);

            const mapped = weekDates.map((date) => {
                const log = logs.find((item) => toYmdString(item.indate) === toYmdString(date));
                return {
                    label: chartLabel(date),
                    value: log ? log.weight : null
                };
            });
            setWeeklyData(mapped);
        } catch (err) {
            console.error('체중 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                type: 'line',
                label: '체중(kg)',
                data: weeklyData.map((d) => d.value),
                borderColor: '#20D793',
                backgroundColor: 'rgba(32, 215, 147, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#20D793',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true,
                spanGaps: true,
                order: 2
            },
            {
                type: 'line',
                label: '목표 체중',
                data: weeklyData.map(() => weightGoal || null),
                borderColor: '#FF5A5F',
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                order: 1
            }
        ]
    };

    return (
        <div className="stats-section">
            <div className="stats-section-title">체중 변화</div>

            {/* 목표 체중 표시 */}
            <div className="stats-goal-grid">
                <div className="stats-goal-item">
                    <span>목표 체중</span>
                    <strong>{weightGoal ? `${weightGoal} kg` : '미설정'}</strong>
                </div>
            </div>

            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
            <div className="stats-chart-wrapper">
                <Chart type="line" data={chartData} options={baseChartOptions(' kg')} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------
// 2. 식사 통계 (foodLog를 날짜별로 합산해 일별 섭취 칼로리 막대그래프)
// ---------------------------------------------------------------
function MealStatsSection() {


    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [dietGoal, setDietGoal] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
    const [metric, setMetric] = useState('calories'); // 'calories' | 'macro'

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    // 식단 목표 조회 (Main.js의 fetchGoals와 동일한 API)
    const fetchGoal = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get(`/api/foodgoal/getFoodGoal/${loginUser.num}`);
            const fg = res.data?.foodGoal;
            if (fg) {
                setDietGoal({
                    calories: fg.goalCalories || 0,
                    carbs: fg.goalCarbs || 0,
                    protein: fg.goalProtein || 0,
                    fat: fg.goalFat || 0,
                });
            }
        } catch (err) {
            console.error('식단 목표 조회 실패:', err);
        }
    }, [loginUser?.num]);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get('/api/foodLog/foodLogList', {
                params: { mnum: loginUser.num }
            });
            const logs = res.data?.foodLogList || [];

            const mapped = weekDates.map((date) => {
                const dayLogs = logs.filter(
                    (log) => toYmdString(log.indate) === toYmdString(date)
                );
                const totalKcal = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
                // 필드명은 실제 foodLog 구조에 맞게 수정하세요
                const totalCarbs = dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
                const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
                const totalFat = dayLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

                return {
                    label: chartLabel(date),
                    calories: dayLogs.length > 0 ? Math.round(totalKcal) : null,
                    carbs: dayLogs.length > 0 ? Math.round(totalCarbs) : null,
                    protein: dayLogs.length > 0 ? Math.round(totalProtein) : null,
                    fat: dayLogs.length > 0 ? Math.round(totalFat) : null,
                };
            });

            setWeeklyData(mapped);
        } catch (err) {
            console.error('식사 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchGoal();
    }, [fetchGoal]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isCalorie = metric === 'calories';

    // 실제 섭취 칼로리(막대) + 목표 칼로리(점선)
    const calorieChartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                type: 'bar',
                label: '섭취 칼로리',
                data: weeklyData.map((d) => d.calories),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderRadius: 6,
                maxBarThickness: 28,
                order: 2
            },
            {
                type: 'line',
                label: '목표 칼로리',
                data: weeklyData.map(() => dietGoal.calories || null),
                borderColor: '#FF5A5F',
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                order: 1
            }
        ]
    };

    // 탄/단/지 막대 + 각각의 목표 점선을 한 그래프에
    const macroChartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                type: 'bar',
                label: '탄수화물',
                data: weeklyData.map((d) => d.carbs),
                backgroundColor: 'rgba(94, 129, 244, 0.75)',
                borderRadius: 4,
                maxBarThickness: 18,
                order: 2
            },
            {
                type: 'bar',
                label: '단백질',
                data: weeklyData.map((d) => d.protein),
                backgroundColor: 'rgba(32, 215, 147, 0.75)',
                borderRadius: 4,
                maxBarThickness: 18,
                order: 2
            },
            {
                type: 'bar',
                label: '지방',
                data: weeklyData.map((d) => d.fat),
                backgroundColor: 'rgba(255, 159, 64, 0.75)',
                borderRadius: 4,
                maxBarThickness: 18,
                order: 2
            },
            {
                type: 'line',
                label: '탄수화물 목표',
                data: weeklyData.map(() => dietGoal.carbs || null),
                borderColor: '#5E81F4',
                borderDash: [4, 3],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                order: 1
            },
            {
                type: 'line',
                label: '단백질 목표',
                data: weeklyData.map(() => dietGoal.protein || null),
                borderColor: '#20D793',
                borderDash: [4, 3],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                order: 1
            },
            {
                type: 'line',
                label: '지방 목표',
                data: weeklyData.map(() => dietGoal.fat || null),
                borderColor: '#FF9F40',
                borderDash: [4, 3],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                order: 1
            }
        ]
    };

    const withLegend = (opts) => ({
        ...opts,
        plugins: {
            ...opts.plugins,
            legend: {
                display: false
            }
        }
    });

    const chartData = isCalorie ? calorieChartData : macroChartData;

    const legendItems = isCalorie
        ? {
            bars: [{ label: '섭취 칼로리', color: 'rgba(255, 159, 64, 0.7)' }],
            goals: [{ label: '목표 칼로리', color: '#FF5A5F' }]
        }
        : {
            bars: [
                { label: '탄수화물', color: 'rgba(94, 129, 244, 0.75)' },
                { label: '단백질', color: 'rgba(32, 215, 147, 0.75)' },
                { label: '지방', color: 'rgba(255, 159, 64, 0.75)' }
            ],
            goals: [
                { label: '탄수화물 목표', color: '#5E81F4' },
                { label: '단백질 목표', color: '#20D793' },
                { label: '지방 목표', color: '#FF9F40' }
            ]
        };

    const chartOptions = withLegend(baseChartOptions(isCalorie ? ' kcal' : ' g'));

    return (
        <div className="stats-section">
            <div className="stats-section-title">식단 통계</div>

            {/* 목표 값 표시 */}
            <div className="stats-goal-grid">
                <div className="stats-goal-item">
                    <span>목표 칼로리</span>
                    <strong>{dietGoal.calories ? `${dietGoal.calories} kcal` : '미설정'}</strong>
                </div>
                <div className="stats-goal-item">
                    <span>목표 탄수화물</span>
                    <strong>{dietGoal.carbs ? `${dietGoal.carbs} g` : '미설정'}</strong>
                </div>
                <div className="stats-goal-item">
                    <span>목표 단백질</span>
                    <strong>{dietGoal.protein ? `${dietGoal.protein} g` : '미설정'}</strong>
                </div>
                <div className="stats-goal-item">
                    <span>목표 지방</span>
                    <strong>{dietGoal.fat ? `${dietGoal.fat} g` : '미설정'}</strong>
                </div>
            </div>

            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

            {/* 칼로리 / 탄단지 토글 */}
            <div className="stats-metric-toggle">
                <button
                    type="button"
                    className={isCalorie ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setMetric('calories')}
                >
                    칼로리
                </button>
                <button
                    type="button"
                    className={!isCalorie ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setMetric('macro')}
                >
                    탄단지
                </button>
            </div>

            {/* 목표 대비 실제 그래프 */}
            <div className="stats-chart-wrapper">
                <div className="stats-custom-legend">
                    <div className="legend-row">
                        {legendItems.bars.map((item) => (
                            <div className="legend-item" key={item.label}>
                                <span className="legend-swatch" style={{ backgroundColor: item.color }} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="legend-row">
                        {legendItems.goals.map((item) => (
                            <div className="legend-item" key={item.label}>
                                <span className="legend-swatch legend-swatch-line" style={{ backgroundColor: item.color }} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}


// ---------------------------------------------------------------
// 3. 운동 통계 (exerciseLog를 날짜별로 합산해 일별 운동시간 막대그래프)
// ---------------------------------------------------------------
function ExerciseStatsSection() {
    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [weightGoal, setWeightGoal] = useState({ exerciseTime: 0, exerciseCalories: 0 });
    const [metric, setMetric] = useState('time'); // 'time' | 'calories'

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    // 운동 목표 조회 (Main.js의 fetchGoals와 동일한 API)
    const fetchGoal = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get(`/api/exercisesgoal/getExercisesGoal/${loginUser.num}`);
            const wg = res.data?.goal;
            if (wg) {
                setWeightGoal({
                    exerciseTime: wg.goalTime || 0,
                    exerciseCalories: wg.goalCalories || 0,
                });
            }
        } catch (err) {
            console.error('운동 목표 조회 실패:', err);
        }
    }, [loginUser?.num]);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get('/api/exerciselog/exercisesLogList', {
                params: { mnum: loginUser.num }
            });
            const logs = res.data?.exerciseLogList || [];

            const mapped = weekDates.map((date) => {
                const dayLogs = logs.filter(
                    (log) => toYmdString(log.indate) === toYmdString(date)
                );
                const totalTime = dayLogs.reduce((sum, log) => sum + (log.exerciseTime || 0), 0);
                // 필드명은 실제 exerciseLog 구조에 맞게 수정하세요
                const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

                return {
                    label: chartLabel(date),
                    time: dayLogs.length > 0 ? totalTime : null,
                    calories: dayLogs.length > 0 ? Math.round(totalCalories) : null
                };
            });

            setWeeklyData(mapped);
        } catch (err) {
            console.error('운동 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchGoal();
    }, [fetchGoal]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isTime = metric === 'time';
    const barColor = isTime ? 'rgba(94, 129, 244, 0.75)' : 'rgba(255, 99, 132, 0.75)';
    const goalValue = isTime ? weightGoal.exerciseTime : weightGoal.exerciseCalories;
    const unit = isTime ? ' 분' : ' kcal';

    const chartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                type: 'bar',
                label: isTime ? '운동시간' : '소모 칼로리',
                data: weeklyData.map((d) => (isTime ? d.time : d.calories)),
                backgroundColor: barColor,
                borderRadius: 6,
                maxBarThickness: 28,
                order: 2
            },
            {
                type: 'line',
                label: isTime ? '목표 운동시간' : '목표 소모 칼로리',
                data: weeklyData.map(() => goalValue || null),
                borderColor: '#FF5A5F',
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                order: 1
            }
        ]
    };

    const baseOpts = baseChartOptions(unit);
    const chartOptions = {
        ...baseOpts,
        plugins: {
            ...baseOpts.plugins,
            legend: {
                display: true,
                position: 'top',
                labels: { boxWidth: 12, font: { size: 11 } }
            }
        }
    };

    return (
        <div className="stats-section">
            <div className="stats-section-title">운동 통계</div>

            {/* 목표 값 표시 */}
            <div className="stats-goal-grid stats-goal-grid-2">
                <div className="stats-goal-item">
                    <span>목표 운동시간</span>
                    <strong>{weightGoal.exerciseTime ? `${weightGoal.exerciseTime}분` : '미설정'}</strong>
                </div>
                <div className="stats-goal-item">
                    <span>목표 소모 칼로리</span>
                    <strong>{weightGoal.exerciseCalories ? `${weightGoal.exerciseCalories} kcal` : '미설정'}</strong>
                </div>
            </div>

            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

            {/* 운동시간 / 소모 칼로리 토글 */}
            <div className="stats-metric-toggle">
                <button
                    type="button"
                    className={isTime ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setMetric('time')}
                >
                    운동시간
                </button>
                <button
                    type="button"
                    className={!isTime ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setMetric('calories')}
                >
                    소모 칼로리
                </button>
            </div>

            {/* 목표 대비 실제 그래프 */}
            <div className="stats-chart-wrapper">
                <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
// ---------------------------------------------------------------
// Stats 메인 페이지
// ---------------------------------------------------------------
function Stats() {
    return (

        <div className="stats-container">
            <div className="stats-page-title">통계</div>
            <WeightStatsSection />
            <MealStatsSection />
            <ExerciseStatsSection />
        </div>
    );
}

export default Stats;
