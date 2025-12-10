import bulletinBoard from '@/actions/App/External/Api/Controllers/BulletinBoard'
import { EventFormData } from '@/Core/Types/BulletinBoard/Events';
import axios from 'axios'

export const EventsApi = {
    async storeEvents(form: EventFormData, municipalSlug: string) {
        const { url, method } = bulletinBoard.EventController.store();

        const { data } = await axios({
            url,
            method,
            data: form,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });
        return data;
    },

    //for admin table api
    async fetch(municipalSlug: string, page: number = 1) {

        const { url, method } = bulletinBoard.EventController.fetch();

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

    //for public facing api 
    async getPublished(municipalSlug: string, page: number = 1) {

        const { url, method } = bulletinBoard.EventController.getPublished();

        const { data } = await axios({
            method,
            url,
            params: { page },
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        })


        return data;
    },

    async deleteEvent(ids: string[], municipalSlug: string) {

        const { url, method } = bulletinBoard.EventController.destroy();

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            },
            data: { ids },
        });

        return data;
    },

    async updateEvent(id: string, municipalSlug: string, form: EventFormData) {

        const { url, method } = bulletinBoard.EventController.update(id);

        const { data } = await axios({
            url,
            method,
            data: form,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;
    }
}