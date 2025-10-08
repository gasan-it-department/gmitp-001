import moment from "moment";


export default function Utility() {

    function generateUniqueId() {
        return Date.now().toString();
    }

    function formatToReadableDate(epochTime: string | undefined) {
        if (epochTime == null) {
            return "Unknown date";
        }
        return moment(parseInt(epochTime, 10) * 1000).format("MMM DD, YYYY hh:mm:ss A")
    }

    function formatAndAddDays(epochTime: string | undefined, additionalDays: number = 0) {
        if (epochTime == null) {
            return "Unknown date";
        }

        return moment(parseInt(epochTime, 10) * 1000)
            .add(additionalDays, "days")
            .format("MMM DD, YYYY hh:mm A");
    }

    function calculateTotalDays(dateApproved: string) {
        if (!dateApproved) return 0;
        const approvedTime = parseInt(dateApproved, 10) * 1000;
        const now = Date.now();
        const diffMs = now - approvedTime;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    function formatTimeAgo(epochString: string) {
        const epoch = parseInt(epochString, 10);
        let time = moment.unix(epoch).fromNow();
        if(time === "a few seconds ago"){
            return 'Just now';
        }
        return moment.unix(epoch).fromNow();
    }


    function setLocalString(key: string, value: string) {
        sessionStorage.setItem(key, value);
    }

    function getLocalString(key: string) {
        return sessionStorage.getItem(key) || "";
    }

    return { generateUniqueId, formatToReadableDate, formatAndAddDays, calculateTotalDays, formatTimeAgo, setLocalString, getLocalString };
}