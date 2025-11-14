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
    }
}