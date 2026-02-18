import Auth from "@/actions/App/External/Api/Controllers/Auth"
import api from "@/lib/axios"
import axios from "@/lib/axios"
import { router } from "@inertiajs/react"
import { resolve } from "path"

export const AuthApi = {
    async login(municipalSlug: string, formData: any) {

        const { url, method } = Auth.AuthenticateUserController.login()

        const response = await api({
            url,
            method,
            data: formData,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }

        });

        const backendRedirectUrl = response.data.redirect

        if (backendRedirectUrl && backendRedirectUrl.includes('otp')) {
            // router.reload();
            router.visit(backendRedirectUrl);

        } else {

            // router.visit(response.data.redirect);
            router.visit(window.location.href, {
                preserveScroll: true,
                preserveState: true,
            });

        }

        return response.data;
    },

    async storeAccount(municipalSlug: string, formData: any) {
        const { url, method } = Auth.CreateUserController.createUser();

        const { data } = await axios({
            url,
            method,
            data: formData,
            headers: {
                'X-municipality-Slug': municipalSlug,
            }
        });


        if (data.redirect === "BACK") {

            //for client redirection ask (harvey)
            router.visit(window.location.href, {
                preserveScroll: true,
                preserveState: true,
            });

        } else {

            //for admin and super admin redirection (ask harvey)
            router.visit(data.redirect);

        }

        return data;

    },

    async logout() {
        const { url, method } = Auth.AuthenticateUserController.logout()

        const { data } = await axios({
            url,
            method,
        });

        router.visit(data.redirect);

        return data;

    }

}