import moment from 'moment';

export default function Utility() {
    function generateUniqueId() {
        return Date.now().toString();
    }

    // function formatToReadableDate(epochTime: string | undefined) {
    //     if (epochTime == null) {
    //         return 'Unknown date';
    //     }
    //     return moment(parseInt(epochTime, 10) * 1000).format('MMM DD, YYYY hh:mm:ss A');
    // }
    function formatToReadableDate(dateTimeString: string | undefined): string {
        if (!dateTimeString) {
            return 'Unknown date';
        }

        const date = moment(dateTimeString);

        if (!date.isValid()) {
            return 'Invalid date format';
        }

        return date.format('MMM DD, YYYY hh:mm A');
    }

    // function formatAndAddDays(epochTime: string | undefined, additionalDays: number = 0) {
    //     if (epochTime == null) {
    //         return 'Unknown date';
    //     }

    //     return moment(parseInt(epochTime, 10) * 1000)
    //         .add(additionalDays, 'days')
    //         .format('MMM DD, YYYY hh:mm A');
    // }
    function formatAndAddDays(dateTimeString: string | undefined, additionalDays: number = 0): string {
        if (!dateTimeString) {
            return 'Unknown date';
        }

        const date = moment(dateTimeString);

        if (!date.isValid()) {
            return `Invalid date: ${dateTimeString}`;
        }

        // 4. Add the specified number of days and format the output
        return date.add(additionalDays, 'days').format('MMM DD, YYYY hh:mm A');
    }

    function calculateTotalDays(dateApproved: string) {
        if (!dateApproved) return 0;
        const approvedTime = parseInt(dateApproved, 10) * 1000;
        const now = Date.now();
        const diffMs = now - approvedTime;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    function formatTimeAgo(epochTime: string) {
        const epochNumber = parseInt(epochTime, 10);
        return moment.unix(epochNumber).fromNow();
    }

    function calculateArrivingDays(epochTime: string | number): string {
        const eventDate = moment(parseInt(epochTime as string, 10) * 1000);
        const now = moment();
        const diffDays = eventDate.startOf("day").diff(now.startOf("day"), "days");

        if (diffDays > 1) return `In ${diffDays} days`;
        if (diffDays === 1) return "In 1 day";
        if (diffDays === 0) return "Today";
        if (diffDays === -1) return "Yesterday";
        return `${Math.abs(diffDays)} days ago`;
    }

    


    return { generateUniqueId, formatToReadableDate, formatAndAddDays, calculateTotalDays, formatTimeAgo, calculateArrivingDays };
}
