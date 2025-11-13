import type { AnnouncementFormData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes'
import axios from 'axios'
import bulletinBoard from '@/actions/App/External/Api/Controllers/BulletinBoard'


export const AnnouncementApi = {
    async storeAnnouncement(form: AnnouncementFormData, municipalSlug: string) {
        const { url, method } = bulletinBoard.AnnouncementController.store();

        const { data } = await axios({
            url, method, data: form,
            headers: {
                'X-Municipality-Slug': municipalSlug
            },
        })

        return data;
    },

    async getAnnouncement(municipalSlug: string) {
        const { url, method, } = bulletinBoard.AnnouncementController.fetch();

        const { data } = await axios({
            url, method,
            headers: {
                'X-Municipality-Slug': municipalSlug

            }
        })
        console.log(data);
        return data;
    }
}