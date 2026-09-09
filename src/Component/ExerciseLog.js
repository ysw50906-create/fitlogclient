import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jaxios from '../util/JWTUtil';
import '../style/Exercise.css';

function ExerciseLog() {
    const today = new Date();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const loginUser = useSelector((state) => state.user);

    const [selectedDate, setSelectedDate] = useState(today);
    // 현재 보고 있는 주의 시작일(일요일)
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [logs, setLogs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputRows, setInputRows] = useState([{ exName: '', exerciseTime: '' }]);
    const [isSaving, setIsSaving] = useState(false);

    // 현재 주의 7일 (일 ~ 토)
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    // Date 객체 또는 서버의 LocalDate → "YYYY-MM-DD"
    const toDateKey = (date) => {
        if (!date) return '';
        // LocalDate는 "2026-08-25" 문자열 또는 [2026, 8, 25] 배열로 내려옴
        if (typeof date === 'string') return date.slice(0, 10);
        if (Array.isArray(date)) {
            const [y, m, d] = date;
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const isSameDate = (a, b) => toDateKey(a) === toDateKey(b);

    // 회원의 전체 운동 기록 조회 (날짜 필터는 화면에서 처리)
    const fetchLogs = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await jaxios.get('/api/exerciselog/exercisesLogList', {
                params: { mnum: loginUser.num },
            });
            setLogs(res.data.exerciseLogList || []);
        } catch (err) {
            console.error(err);
            setLogs([]);
        }
    }, [loginUser.num]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter((log) =>
        isSameDate(log.indate, selectedDate)
    );

    const totalExerciseTime = filteredLogs.reduce(
        (sum, log) => sum + (log.exerciseTime || 0),
        0
    );

    const totalCalories = filteredLogs.reduce(
        (sum, log) => sum + (log.calories || 0),
        0
    );

    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = weekdays[date.getDay()];
        return `${month}월 ${day}일 (${weekday})`;
    };

    // 주 범위 라벨 (예: 8월 17일 ~ 8월 23일)
    const weekRangeLabel = () => {
        const start = weekDates[0];
        const end = weekDates[6];
        return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
    };

    const handlePrevWeek = () => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() - 7);
        setWeekStart(d);
    };

    const handleNextWeek = () => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + 7);
        setWeekStart(d);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const handleAddClick = () => {
        setInputRows([{ exName: '', exerciseTime: '' }]);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleRowChange = (index, field, value) => {
        setInputRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleAddRow = () => {
        setInputRows((prev) => [...prev, { exName: '', exerciseTime: '' }]);
    };

    const handleRemoveRow = (index) => {
        setInputRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleModalSave = async () => {
        if (isSaving) return;

        const validRows = inputRows.filter(
            (row) => row.exName && row.exerciseTime
        );
        if (validRows.length === 0) return;

        setIsSaving(true);

        try {
            for (const row of validRows) {
                await jaxios.post(
                    '/api/exerciselog/addExercisesLog',
                    {
                        exName: row.exName,
                        exerciseTime: Number(row.exerciseTime),
                        indate: toDateKey(selectedDate),
                    },
                    { params: { mnum: loginUser.num } }
                );
            }
            setIsModalOpen(false);
            fetchLogs();
        } catch (err) {
            console.error(err);
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = async (num) => {
        if (!window.confirm('기록을 삭제하시겠습니까?')) return;

        try {
            await jaxios.delete(`/api/exerciselog/deleteExerciseLog/${num}`);
            fetchLogs();
        } catch (err) {
            console.error(err);
            alert('삭제에 실패했습니다.');
        }
    };

    return (
        <div className="exlog-container">
            {/* 주간 날짜 선택 */}
            <div className="exlog-week-wrapper">
                <div className="exlog-week-nav">
                    <div className="exlog-week-nav-btn" onClick={handlePrevWeek}>
                        &larr;
                    </div>
                    <div className="exlog-week-range">{weekRangeLabel()}</div>
                    <div className="exlog-week-nav-btn" onClick={handleNextWeek}>
                        &rarr;
                    </div>
                </div>

                <div className="exlog-week">
                    {weekDates.map((date) => {
                        const isSelected = isSameDate(date, selectedDate);
                        const isToday = isSameDate(date, today);
                        return (
                            <div
                                key={toDateKey(date)}
                                className={`exlog-week-day ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDateClick(date)}
                            >
                                <div className="exlog-week-weekday">
                                    {weekdays[date.getDay()]}
                                </div>
                                <div className="exlog-week-date">
                                    {date.getDate()}
                                </div>
                                {isToday && <div className="exlog-week-today-dot" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 날짜 헤더 */}
            <div className="exlog-date-header">{formatDate(selectedDate)}</div>

            {/* 요약 카드 */}
            <div className="exlog-summary-card">
                {filteredLogs.length === 0 ? (
                    <div className="exlog-summary-empty">운동 기록이 없어요</div>
                ) : (
                    <div className="exlog-summary-stats">
                        <div className="exlog-summary-item">
                            <div className="exlog-summary-label">총 운동시간</div>
                            <div className="exlog-summary-value">
                                {totalExerciseTime}
                                <span className="exlog-summary-unit">분</span>
                            </div>
                        </div>
                        <div className="exlog-summary-divider" />
                        <div className="exlog-summary-item">
                            <div className="exlog-summary-label">소모 칼로리</div>
                            <div className="exlog-summary-value">
                                {totalCalories}
                                <span className="exlog-summary-unit">kcal</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 운동 기록 목록 */}
            <div className="exlog-list">
                {filteredLogs.length === 0 ? (
                    <div className="exlog-list-empty">등록된 기록이 없어요</div>
                ) : (
                    filteredLogs.map((log) => (
                        <div className="exlog-item" key={log.num}>
                            <div className="exlog-item-main">
                                <div className="exlog-item-name">{log.exName}</div>
                                <div className="exlog-item-meta">
                                    {log.exerciseTime}분
                                </div>
                            </div>
                            <div className="exlog-item-right">
                                <span className="exlog-item-cal">
                                    {log.calories}kcal
                                </span>
                                <span
                                    className="exlog-item-delete"
                                    onClick={() => handleDeleteClick(log.num)}
                                >
                                    ✕
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 추가 버튼 (스크롤해도 하단 고정) */}
            <div className="exlog-add-row">
                <div className="exlog-add-btn" onClick={handleAddClick}>
                    + 운동 기록 추가
                </div>
            </div>

            {/* 운동 기록 추가 모달 */}
            {isModalOpen && (
                <div className="exlog-modal-overlay" onClick={handleModalClose}>
                    <div
                        className="exlog-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="exlog-modal-title">운동 기록 추가</div>

                        <div className="exlog-modal-selected-date">
                            {formatDate(selectedDate)}에 기록됩니다
                        </div>

                        <div className="exlog-modal-divider">
                            <span>운동 종류 / 시간</span>
                        </div>

                        <div className="exlog-modal-rows">
                            {inputRows.map((row, index) => (
                                <div className="exlog-modal-row" key={index}>
                                    <input
                                        type="text"
                                        className="exlog-modal-input exlog-modal-name-input"
                                        placeholder="예: 달리기"
                                        value={row.exName}
                                        onChange={(e) =>
                                            handleRowChange(
                                                index,
                                                'exName',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <div className="exlog-modal-time-wrapper">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="exlog-modal-input exlog-modal-time-input"
                                            placeholder="0"
                                            value={row.exerciseTime}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'exerciseTime',
                                                    e.target.value.replace(/[^0-9]/g, '')
                                                )
                                            }
                                        />
                                        <span className="exlog-modal-unit">분</span>
                                    </div>
                                    {inputRows.length > 1 && (
                                        <span
                                            className="exlog-modal-row-delete"
                                            onClick={() => handleRemoveRow(index)}
                                        >
                                            ✕
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div
                            className="exlog-modal-add-row-btn"
                            onClick={handleAddRow}
                        >
                            + 운동 추가
                        </div>

                        <div className="exlog-modal-actions">
                            <div
                                className="exlog-modal-cancel-btn"
                                onClick={handleModalClose}
                            >
                                취소
                            </div>
                            <div
                                className={`exlog-modal-save-btn ${isSaving ? 'loading' : ''}`}
                                onClick={handleModalSave}
                            >
                                {isSaving ? '저장 중...' : '저장'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExerciseLog;