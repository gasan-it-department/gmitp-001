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

    async fetch(municipalSlug: string) {

        const { url, method } = bulletinBoard.EventController.fetch();

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;
    },

    async getPublished(municipalSlug: string) {

        const { url, method } = bulletinBoard.EventController.getPublished();

        const { data } = await axios({
            method,
            url,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        })


        return data;
    },

    async deleteEvent(id: string, municipalSlug: string) {

        const { url, method } = bulletinBoard.EventController.destroy(id);

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;
    },

    async updateEvent(id: string, municipalSlug: string) {

        const { url, method } = bulletinBoard.EventController.update(id);

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipal-Slug': municipalSlug
            }
        });

        return data;
    }
}