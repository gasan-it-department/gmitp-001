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

    function getProvinces() {
        return [
            'Marinduque'
        ];
    }

    function getMunicipalities() {
        return [
            'Boac',
            'Buenavista',
            'Gasan',
            'Mogpog',
            'Santa Cruz',
            'Torrijos',
        ];
    }

    function getBarangays() {
        return {
            "Boac": [
                "Agot", "Amoingon", "Apitong", "Balaring", "Balimbing", "Balogo",
                "Bangbangalon", "Bantad", "Bantay", "Bayuti", "Binunga", "Boton",
                "Buliasnin", "Bunganay", "Cawit", "Cogon", "Daig", "Duyay",
                "Hinapulan", "Ihatub", "Isok I", "Isok II", "Libas", "Lupac",
                "Mahinhin", "Mainit", "Malbog", "Maligaya", "Mansiwat", "Mataas na Bayan",
                "Maybo", "Mercado", "Murallon", "Ogbac", "Paye", "Pili",
                "Poctoy", "Poras", "Puyog", "Sabong", "San Miguel", "Santol",
                "Tabigue", "Tabi", "Tugos", "Tumagabok", "Tumingad", "Tungib-Lipata"
            ],

            "Buenavista": [
                "Bagacay", "Bagtingon", "Bicas-Bicas", "Caigangan", "Daykitin", "Libas",
                "Malbog", "Mampang", "San Isidro", "San Pedro", "Siain", "Timbo",
                "Yook"
            ],

            "Gasan": [
                "Antipolo", "Bacong-Bacong", "Bahi", "Bangbang", "Banot", "Banuyo",
                "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)",
                "Barra", "Bognuyan", "Cabugao", "Dawis", "Dili", "Libtangin",
                "Mahunig", "Mangiliol", "Masiga", "Matandang Gasan", "Tabionan",
                "Tapuyan", "Tiguion"
            ],

            "Mogpog": [
                "Argao", "Balanacan", "Banto", "Bintakay", "Bocboc", "Butansapa",
                "Candahon", "Capayang", "Danao", "Dulong Bayan", "Gitnang Bayan",
                "Guisian", "Hinadharan", "Hinanggayon", "Ino", "Janagdong",
                "Lamesa", "Laon", "Malusak", "Mampaitan", "Mangyan-Mababad",
                "Market Site", "Mataas na Bayan", "Menstrual", "Nangka I",
                "Nangka II", "Paye", "Pili", "Puting Buhangin", "Sayao",
                "Silangan", "Sumangga", "Tarug", "Tugos"
            ],

            "Santa Cruz": [
                "Alobo", "Angas", "Aturan", "Baguidbirin", "Balogo", "Banahaw",
                "Bangcuangan", "Banogbog", "Biga", "Botilao", "Buyabod", "Dating Bayan",
                "Devilla", "Dolores", "Hupi", "Ipil", "Jolo", "Kaganhao",
                "Kalangkang", "Kasily", "Kilo-kilo", "Kiñaman", "Libjo", "Lipa",
                "Lusok", "Maharlika", "Makulapnit", "Maniwaya", "Masaguisi",
                "Matalaba", "Mongpong", "Morales", "Napo", "Paniquihan", "Pantayin",
                "Poblacion", "Poctoy", "Punong", "San Antonio", "San Isidro",
                "San Jose", "Tagum", "Tamayo", "Tawiran", "Tungib"
            ],

            "Torrijos": [
                "Bangwayin", "Bayakbakin", "Bonliw", "Buangan", "Cabuyo", "Cagpo",
                "Dampulan", "Kay Duke", "Makawayan", "Malibago", "Maranlig",
                "Matuyatuya", "Nangka", "Pakaskasan", "Payanas", "Poblacion",
                "Poctoy", "Sibuyao", "Suha", "Talawan"
            ]
        };
    }

    return { generateUniqueId, formatToReadableDate, formatAndAddDays, calculateTotalDays, getProvinces, getMunicipalities, getBarangays };
}