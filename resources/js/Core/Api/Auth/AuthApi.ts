import Auth from "@/actions/App/External/Api/Controllers/Auth"
import axios from 'axios'


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

        if (response.data.redirect) {

            window.location.href = response.data.redirect;

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

        return data;

    }

}