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

    return { generateUniqueId, formatToReadableDate, formatAndAddDays };
}