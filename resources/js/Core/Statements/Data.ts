import axios from "axios";

export const getRequest = async () => {
    const { data, status } = await axios.get("/action-center/request")
    if (status !== 200) {
        throw new Error(data)
    }
    return data
}