import Auth from "@/actions/App/External/Api/Controllers/Auth"
import api from "@/lib/axios"
import axios from "@/lib/axios"
import { router } from "@inertiajs/react"

export const AuthApi = {

    async logout() {
        const { url, method } = Auth.LogoutController()

        const { data } = await axios({
            url,
            method,
        });

        router.visit(data.redirect);

        return data;

    }

}