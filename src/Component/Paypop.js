import { useEffect, useRef, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useParams } from "react-router-dom";

const CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

function Paypop() {
    const widgetsRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    let { orderName, amount } = useParams();
    amount = Number(amount) || 1000;

    useEffect(() => {
        let isMounted = true;
        async function initWidget() {
            try {
                const tossPayments = await loadTossPayments(CLIENT_KEY);

                // 비회원 결제는 ANONYMOUS, 회원별 결제는 실제 유저 고유 ID를 넣어주세요.
                const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

                await widgets.setAmount({
                    currency: "KRW",
                    value: amount,
                });

                await Promise.all([
                    widgets.renderPaymentMethods({
                        selector: "#payment-method",
                        variantKey: "DEFAULT",
                    }),

                    widgets.renderAgreement({
                        selector: "#agreement",
                        variantKey: "AGREEMENT",
                    }),
                ]);

                if (isMounted) {
                    widgetsRef.current = widgets;
                    setReady(true);
                }
            } catch (err) {
                console.error("결제위젯 초기화 실패", err);
                if (isMounted) setError(err);
            }
        }

        initWidget();

        return () => {
            isMounted = false;
        };
    }, [amount]);

    async function handlePayClick() {
        const widgets = widgetsRef.current;
        if (!widgets) return;

        try {
            const orderId =
            `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

            sessionStorage.setItem("orderName", orderName);

            await widgets.requestPayment({
                orderId,
                orderName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: "test@example.com",
                customerName: "테스트 사용자",
            });
        } catch (err) {
            // 사용자가 결제창을 닫는 등 취소한 경우도 여기로 들어옵니다.
            console.error("결제 요청 실패/취소", err);
            setError(err);
            alert('결제가 취소되었습니다')
            window.opener.location.href = "/mypage";
            window.close();


            // console.error("========== Toss 결제 오류 ==========");
            // console.error(err);
            // console.error("name:", err?.name);
            // console.error("message:", err?.message);
            // console.error("code:", err?.code);
            // console.error("====================================");

            // alert(
            //     `결제 요청 실패\n\n` +
            //     `code: ${err?.code ?? ''}\n` +
            //     `message: ${err?.message ?? ''}`
            // );
            
        }
    }

    if (error) {
        return <div>결제위젯을 불러오는 중 문제가 발생했습니다: {error.message}</div>;
    }

    return (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div id="payment-method" />
            <div id="agreement" />
            <button
                onClick={handlePayClick}
                disabled={!ready}
                style={{
                    width: "100%",
                    padding: "14px 0",
                    marginTop: 16,
                    borderRadius: 8,
                    border: "none",
                    background: ready ? "#3182f6" : "#ccc",
                    color: "#fff",
                    fontSize: 16,
                    cursor: ready ? "pointer" : "not-allowed",
                }}
            >
                {amount.toLocaleString()}원 결제하기
            </button>
        </div>
    );
}

export default Paypop