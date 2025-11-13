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

    function formatToReadableDateNoTime(dateTime: string | number | undefined): string {
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

        return dateMoment.format("MMM DD, YYYY");
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
        if (!dateTimeString) return "Unknown date";

        let dateMoment: moment.Moment;

        if (!isNaN(Number(dateTimeString))) {
            const epoch = Number(dateTimeString);
            dateMoment = epoch > 9999999999
                ? moment(epoch)
                : moment.unix(epoch);
        } else {
            dateMoment = moment.parseZone(dateTimeString).local();
        }

        if (!dateMoment.isValid()) return `Invalid date: ${dateTimeString}`;

        return dateMoment.add((additionalDays + 2), 'days').format("MMM DD, YYYY");
    }

    function formatAndAddDaysNoTime(dateTimeString: string | undefined, additionalDays: number = 0): string {
        if (!dateTimeString) return "Unknown date";

        let dateMoment: moment.Moment;

        if (!isNaN(Number(dateTimeString))) {
            const epoch = Number(dateTimeString);
            dateMoment = epoch > 9999999999
                ? moment(epoch)
                : moment.unix(epoch);
        } else {
            dateMoment = moment.parseZone(dateTimeString).local();
        }

        if (!dateMoment.isValid()) return `Invalid date: ${dateTimeString}`;

        return dateMoment.add((additionalDays + 2), 'days').format("MMM DD, YYYY");
    }

    function calculateTotalDays(dateApproved: string) {
        if (!dateApproved) return 0;
        const approvedTime = parseInt(dateApproved, 10) * 1000;
        const now = Date.now();
        const diffMs = now - approvedTime;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    function formatTimeAgo(time: string | number) {
        const now = new Date().getTime();
        let date: Date;
        if (typeof time === "number") {
            date = new Date(time);
        } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) {
            // Parse "YYYY-MM-DD HH:mm:ss"
            const [datePart, timePart] = time.split(" ");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, min, sec] = timePart.split(":").map(Number);
            date = new Date(year, month - 1, day, hour, min, sec);
        } else {
            date = new Date(time);
        }
        if (isNaN(date.getTime())) return "Invalid date";
        const seconds = Math.floor((now - date.getTime()) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return mins === 1 ? "1 min ago" : `${mins} mins ago`;
        }
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return hours === 1 ? "1 hr ago" : `${hours} hrs ago`;
        }
        if (seconds < 2592000) {
            const days = Math.floor(seconds / 86400);
            return days === 1 ? "1 day ago" : `${days} days ago`;
        }
        if (seconds < 31536000) {
            const months = Math.floor(seconds / 2592000);
            return months === 1 ? "1 mon ago" : `${months} mons ago`;
        } else {
            const years = Math.floor(seconds / 31536000);
            return years === 1 ? "1 year ago" : `${years} years ago`;
        }
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




    return {
        generateUniqueId,
        formatToReadableDate,
        formatAndAddDays,
        calculateTotalDays,
        formatTimeAgo,
        calculateArrivingDays,
        formatToReadableDateNoTime,
        formatAndAddDaysNoTime
    };
}
