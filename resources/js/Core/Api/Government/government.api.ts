import Government from "@/actions/App/External/Api/Controllers/Government"
import axios from "axios";

export const GovernmentApi = {

    async SearhOfficial(query: string) {

        const { url, method } = Government.Official.SearchOfficialsController();

        const response = await axios({
            url,
            method,
            params: { query }
        })

        return response.data.data;

    }
}