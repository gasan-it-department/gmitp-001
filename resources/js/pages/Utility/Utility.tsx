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
    function formatToReadableDate(dateTime: string | number | undefined): string {
        if (!dateTime) {
            return "Unknown date";
        }

        let dateMoment;

        // Handle numeric epoch (either seconds or milliseconds)
        if (!isNaN(Number(dateTime))) {
            const epoch = Number(dateTime);
            dateMoment = epoch > 9999999999
                ? moment(epoch) // milliseconds
                : moment.unix(epoch); // seconds
        }
        // Otherwise, assume ISO or readable date string
        else {
            dateMoment = moment(dateTime);
        }

        if (!dateMoment.isValid()) {
            return "Invalid date format";
        }

        return dateMoment.format("MMM DD, YYYY hh:mm A");
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

    function formatTimeAgo(time: string | number) {
        let dateMoment;

        // If it's a number or numeric string (epoch timestamp)
        if (!isNaN(Number(time))) {
            const epochNumber = Number(time);
            // Detect if in seconds or milliseconds
            dateMoment = epochNumber > 9999999999
                ? moment(epochNumber) // milliseconds
                : moment.unix(epochNumber); // seconds
        }
        // Otherwise, assume ISO or standard date string
        else {
            dateMoment = moment(time);
        }

        if (!dateMoment.isValid()) return "Invalid date";
        return dateMoment.fromNow();
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
