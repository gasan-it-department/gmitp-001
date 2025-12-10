import Auth from "@/actions/App/External/Api/Controllers/Auth"
import axios from "@/lib/axios"
import { router } from "@inertiajs/react"

export const AuthApi = {
    async login(municipalSlug: string, formData: any) {

        const { url, method } = Auth.AuthenticateUserController.login()

        const response = await axios({
            url,
            method,
            data: formData,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }

        });

        if (response.data.redirect === "BACK") {

            // router.reload();
            router.visit(window.location.href, {
                preserveScroll: true,
                preserveState: true,
            });

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