import axios from "axios";

export const axiosApi = axios.create({
    baseURL: 'https://japcompany.o-r.kr', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});