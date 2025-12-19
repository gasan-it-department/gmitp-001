import type { AnnouncementFormData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes'
import axios from 'axios'
import bulletinBoard from '@/actions/App/External/Api/Controllers/BulletinBoard'


export const AnnouncementApi = {
    async storeAnnouncement(form: AnnouncementFormData, municipalSlug: string) {
        const { url, method } = bulletinBoard.AnnouncementController.store();

        const { data } = await axios({
            url,
            method,
            data: form,
            headers: {
                'X-Municipality-Slug': municipalSlug
            },
        });

        return data;
    },

    async getAnnouncement(municipalSlug: string, page: number = 1) {
        const { url, method, } = bulletinBoard.AnnouncementController.fetch();

        const { data } = await axios({
            url, method,
            params: { page },
            headers: {
                'X-Municipality-Slug': municipalSlug

            }
        });

        return data;
    },

    async getPublishedAnnouncements(municipalSlug: string, page: number = 1) {
        const { url, method } = bulletinBoard.AnnouncementController.getPublished();

        const { data } = await axios({
            url,
            method,
            params: { page },
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    },

    async updateAnnouncement(municipalSlug: string, id: string, updateData: any) {

        const { url, method } = bulletinBoard.AnnouncementController.update({ id });

        const { data } = await axios({
            url,
            method,
            data: updateData,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    },

    async deleteAnnouncement(id: string, municipalSlug: string) {
        const { url, method } = bulletinBoard.AnnouncementController.destroy({ id });

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;
    },

    async deleteMultiple(ids: string[], municipalSlug: string) {

        const { url, method } = bulletinBoard.AnnouncementController.destroyMultiple();

        const { data } = await axios({
            url,
            method,
            data: {
                idList: ids
            },
            headers: {
                'X-Municipality-Slug': municipalSlug,
            }
        });

        return data;

    }
}