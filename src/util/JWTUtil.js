import axios from "axios";
import { Cookies } from "react-cookie";
const jaxios = axios.create()
const cookies = new Cookies()

const beforeReq = (config) => {
    // 쿠키에 있는 토큰을 header에 포함시킵니다
    // 쿠키에서 사용자정보를 불러옵니다
    const loginUser = cookies.get('user')
    if (!loginUser || !loginUser.id) {
        // 현재 로그인 정보가 없다면 에러메세지를 갖고 jaxios로 요청한 곳으로 돌아갑니다
        alert('로그인이 필요한 서비스 입니다')
        return Promise.reject(
            { response: { data: { error: "REQUIRE_LOGIN" } } }
            // REQUIRE_LOGIN는 react에서 result.data.error 를 console 에 출력하면 확인이 가능합니다
        )
    }
    const { accessToken } = loginUser
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
}

const requestFail = (err) => {
    return Promise.reject(err)
}

const beforeRes = async (res) => {
    // jaxios로 보낸 요청에 대해 서버에서 응답을 보내면
    // 토큰에러에 대한 응답인지를 체크해서 , 토큰 에러라면 토큰을 갱신하고 현재요청을 재요청합니다
    let loginUser = cookies.get('user')
    // 응답 내용을 꺼내서 data 변수에 저장    
    const data = res.data
    if (data && data.error === 'ERROR_ACCESS_TOKEN') {
        // 토큰이 기간 만료된경우

        const result = await axios.get(`/api/member/refresh/${loginUser.refreshToken}`, { headers: { "Authorization": `Bearer ${loginUser.accessToken}` } })

        // 위요청의 응답은 갱신되었거나 유효기간이 지나지 않은 원래 토큰이 담겨서 옵니다
        loginUser.accessToken = result.data.accessToken;
        loginUser.refreshToken = result.data.refreshToken;
        cookies.set('user', JSON.stringify(loginUser), { path: '/', })
        const originalRequest = res.config
        originalRequest.headers.Authorization = `Bearer ${result.data.accessToken}`
        return await axios(originalRequest)  // 새로운 요청을 보내고 받은 응답을 리턴
    }

    return res   // 원래의 요청에 대한 응답을 리턴
}

const responseFail = (err) => {
    return Promise.reject(err)
}

jaxios.interceptors.request.use(beforeReq, requestFail)
jaxios.interceptors.response.use(beforeRes, responseFail)

export default jaxios
