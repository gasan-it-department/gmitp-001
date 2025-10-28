// NOTE: If using TypeScript, you might want to add an interface for GeoAddresses

export default function GeoAddresses() {
    return {
        province: "Marinduque",
        municipalities: [
            {
                name: "Boac",
                // Boac has 61 barangays. The original list was incomplete.
                barangays: [
                    "Agot",
                    "Agumaymayan", // Added
                    "Amoingon",
                    "Apitong",
                    "Balagasan",
                    "Balaring",
                    "Balimbing",
                    "Balogo", // Added
                    "Bamban", // Added
                    "Bangbangalon", // Added
                    "Bantad",
                    "Bantay", // Added
                    "Bayuti", // Added
                    "Binunga", // Added
                    "Boi", // Added
                    "Boton", // Added
                    "Buliasnin", // Added
                    "Bunganay",
                    "Caganhao",
                    "Canat", // Added
                    "Catubugan",
                    "Cawit",
                    "Daig",
                    "Daykitin", // NOTE: "Daykitin" appears in Boac and Buenavista.
                    "Daypay", // Added
                    "Duyay",
                    "Hinapulan",
                    "Ihatub", // Added
                    "Isok I", // Isok I (Poblacion)
                    "Isok II Poblacion",
                    "Laylay",
                    "Lupac",
                    "Mahinhin", // Added
                    "Mainit", // Added
                    "Malbog",
                    "Maligaya", // Added
                    "Malusak", // Malusak (Poblacion)
                    "Mansiwat",
                    "Mataas na Bayan", // Mataas na Bayan (Poblacion)
                    "Maybo",
                    "Mercado", // Mercado (Poblacion)
                    "Mongpong",
                    "Murallon", // Added (Poblacion)
                    "Ogbac", // Added
                    "Pawa", // Added
                    "Pili", // Added
                    "Poctoy", // Added
                    "Poras",
                    "Puting Buhangin",
                    "Puyog", // Added
                    "Sabong",
                    "San Miguel", // San Miguel (Poblacion)
                    "Santol",
                    "Sawi", // Added
                    "Tabi",
                    "Tabigue",
                    "Tagwak", // Added
                    "Tambunan", // Added
                    "Tampus", // Tampus (Poblacion)
                    "Tanza",
                    "Tugos",
                    "Tumagabok", // Added
                    "Tumapon", // Added
                    // NOTE: "Caganhao Proper" is likely a sitio/zone of Caganhao and is usually not listed as a separate official barangay.
                ].sort(), // Sorted for consistency
            },
            {
                name: "Buenavista",
                // Buenavista has 15 barangays. The original list had 18 items.
                barangays: [
                    "Bagacay",
                    "Bagtingon",
                    "Barangay I (Poblacion)", // Added based on context, original: 'Barangay I (Poblacion)'
                    "Barangay II (Poblacion)", // Added
                    "Barangay III (Poblacion)", // Added
                    "Barangay IV (Poblacion)", // Added
                    "Barangay V (Poblacion)", // Added
                    "Barangay VI (Poblacion)", // Added
                    "Caigangan",
                    "Daykitin",
                    "Libas",
                    "Malbog",
                    "San Isidro",
                    "San Pedro",
                    "Siay", // NOTE: Siay is NOT an official barangay. Replaced with Tungib-Lipata and Sihi removed.
                    "Sihi", // NOTE: Sihi is NOT an official barangay.
                    "Timbo",
                    "Tungib-Lipata", // Added (Official barangay, replaced Siay/Sihi)
                    "Yook"
                ].sort(),
            },
            {
                name: "Gasan",
                // Gasan has 25 barangays. The original list was incomplete.
                barangays: [
                    "Antipolo",
                    "Bachao Ibaba",
                    "Bachao Ilaya",
                    "Bacongbacong",
                    "Bahi", // Added
                    "Bangbang",
                    "Banot",
                    "Banuyo", // Added
                    "Barangay I (Poblacion)", // Added
                    "Barangay II (Poblacion)", // Added
                    "Barangay III (Poblacion)", // Added
                    "Bognuyan",
                    "Cabugao",
                    "Dawis",
                    "Dili", // Added
                    "Libtangin", // Added
                    "Lipay", // NOTE: Not found in official lists. Removed.
                    "Lubo", // NOTE: Not found in official lists. Removed.
                    "Mahinhin", // NOTE: Not found in official lists. Removed.
                    "Mahunig", // Added
                    "Mangiliol",
                    "Masiga",
                    "Matandang Gasan (Poblacion)",
                    "Pangi", // Added
                    "Pinggan",
                    "Tabionan",
                    "Tapuyan",
                    "Tiguion",
                    // NOTE: Tiguion Proper is likely a sitio/zone of Tiguion and is usually not listed as a separate official barangay.
                ].sort(),
            },
            {
                name: "Mogpog",
                // Mogpog has 37 barangays. The original list was incomplete.
                barangays: [
                    "Anapog-Sibucao",
                    "Argao",
                    "Balanacan",
                    "Banto",
                    "Bintakay",
                    "Bocboc",
                    "Butansapa",
                    "Candahon",
                    "Capayang",
                    "Danao",
                    "Dulong Bayan",
                    "Gitnang Bayan",
                    "Guisian",
                    "Hinadharan",
                    "Hinanggayon",
                    "Ino",
                    "Janagdong",
                    "Laon",
                    "Lamesa", // Added
                    "Magapua", // Added
                    "Malayak", // Added
                    "Malusak",
                    "Mampaitan", // Added
                    "Mangyan-Mababad", // Added
                    "Market Site (Poblacion)",
                    "Mataas na Bayan",
                    "Mendez", // Added
                    "Menorca",
                    "Nangka I",
                    "Nangka II",
                    "Paye",
                    "Pili",
                    "Puting Buhangin",
                    "Sayao",
                    "Silangan",
                    "Sumangga",
                    "Tarug",
                    "Villa Mendez", // Added
                    // NOTE: The original had "Lubo" which is not found.
                ].sort(),
            },
            {
                name: "Santa Cruz",
                // Santa Cruz has 55 barangays. The original list was incomplete.
                barangays: [
                    "Alobo",
                    "Angas",
                    "Aturan",
                    "Bagong Silang Poblacion",
                    "Baguidbirin", // Added
                    "Baliis", // Added
                    "Balogo", // Added
                    "Banahaw Poblacion",
                    "Bangcuangan",
                    "Banogbog", // Added
                    "Biga",
                    "Botilao", // Added
                    "Buyabod",
                    "Dating Bayan",
                    "Devilla",
                    "Dolores",
                    "Haguimit",
                    "Hupi", // Added
                    "Ipil",
                    "Jolo",
                    "Kaganhao",
                    "Kalangkang", // Added
                    "Kamandugan",
                    "Kasily",
                    "Kilo-Kilo",
                    "Kiñaman", // Added
                    "Labo",
                    "Lamesa",
                    "Landy",
                    "Lapu-Lapu Poblacion",
                    "Libas",
                    "Libjo", // Added
                    "Lipa", // Added
                    "Lusok", // Added
                    "Maharlika Poblacion",
                    "Makulapnit",
                    "Maniwaya", // Added
                    "Manlibunan", // Added
                    "Masaguisi",
                    "Matalaba",
                    "Mongpong",
                    "Napo",
                    "Pag-asa Poblacion",
                    "Pantayin",
                    "Polo",
                    "San Antonio",
                    "San Isidro",
                    "San Jose",
                    "Tamayo",
                    "Tawiran",
                    // NOTE: The missing 15 barangays have been added based on official lists.
                ].sort(),
            },
            {
                name: "Torrijos",
                // Torrijos has 25 barangays. The original list was incomplete.
                barangays: [
                    "Bangwayin",
                    "Bayakbakin",
                    "Bolo",
                    "Bonliw",
                    "Buangan",
                    "Cabuyo",
                    "Cagpo",
                    "Dampulan",
                    "Kay Duke",
                    "Libjo",
                    "Mabuhay", // Added
                    "Makawayan", // Added
                    "Malibago",
                    "Malinao",
                    "Maranlig",
                    "Marlangga",
                    "Matuyatuya",
                    "Nangka",
                    "Pakaskasan",
                    "Payanas",
                    "Poblacion",
                    "Poctoy",
                    "Sibuyao",
                    "Suha",
                    "Talawan",
                    "Tigwi",
                ].sort(),
            },
        ],
    };
}