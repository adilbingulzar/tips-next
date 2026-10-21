/** Countries offered at sign-up, in the old app's order (Netherlands first), with dialling codes. */
export const COUNTRIES = [
    {
        "code": "NL",
        "name": "Netherlands",
        "dial": "31"
    },
    {
        "code": "DE",
        "name": "Germany",
        "dial": "49"
    },
    {
        "code": "GB",
        "name": "United Kingdom",
        "dial": "44"
    },
    {
        "code": "AE",
        "name": "United Arab Emirates",
        "dial": "971"
    },
    {
        "code": "SA",
        "name": "Kingdom of Soudi Arabia",
        "dial": "966"
    },
    {
        "code": "QA",
        "name": "Qatar",
        "dial": "974"
    },
    {
        "code": "KW",
        "name": "Kuwait",
        "dial": "965"
    },
    {
        "code": "BH",
        "name": "Bahrain",
        "dial": "973"
    },
    {
        "code": "FR",
        "name": "France",
        "dial": "33"
    },
    {
        "code": "IT",
        "name": "Italy",
        "dial": "39"
    },
    {
        "code": "ES",
        "name": "Spain",
        "dial": "34"
    },
    {
        "code": "PL",
        "name": "Poland",
        "dial": "48"
    },
    {
        "code": "UA",
        "name": "Ukraine",
        "dial": "380"
    },
    {
        "code": "RO",
        "name": "Romania",
        "dial": "40"
    },
    {
        "code": "BE",
        "name": "Belgium",
        "dial": "32"
    },
    {
        "code": "SE",
        "name": "Sweden",
        "dial": "46"
    },
    {
        "code": "CZ",
        "name": "Czech Republic",
        "dial": "420"
    },
    {
        "code": "GR",
        "name": "Greece",
        "dial": "30"
    },
    {
        "code": "PT",
        "name": "Portugal",
        "dial": "351"
    },
    {
        "code": "HU",
        "name": "Hungary",
        "dial": "36"
    },
    {
        "code": "BY",
        "name": "Belarus",
        "dial": "375"
    },
    {
        "code": "AT",
        "name": "Austria",
        "dial": "43"
    },
    {
        "code": "CH",
        "name": "Switzerland",
        "dial": "41"
    },
    {
        "code": "RS",
        "name": "Serbia",
        "dial": "381"
    },
    {
        "code": "BG",
        "name": "Bulgaria",
        "dial": "359"
    },
    {
        "code": "DK",
        "name": "Denmark",
        "dial": "45"
    },
    {
        "code": "SK",
        "name": "Slovakia",
        "dial": "421"
    },
    {
        "code": "FI",
        "name": "Finland",
        "dial": "358"
    },
    {
        "code": "NO",
        "name": "Norway",
        "dial": "47"
    },
    {
        "code": "IE",
        "name": "Ireland",
        "dial": "353"
    },
    {
        "code": "HR",
        "name": "Croatia",
        "dial": "385"
    },
    {
        "code": "MD",
        "name": "Moldova",
        "dial": "373"
    },
    {
        "code": "BA",
        "name": "Bosnia and Herzegovina",
        "dial": "387"
    },
    {
        "code": "AL",
        "name": "Albania",
        "dial": "355"
    },
    {
        "code": "LT",
        "name": "Lithuania",
        "dial": "370"
    },
    {
        "code": "SI",
        "name": "Slovenia",
        "dial": "386"
    },
    {
        "code": "MK",
        "name": "North Macedonia",
        "dial": "389"
    },
    {
        "code": "LV",
        "name": "Latvia",
        "dial": "371"
    },
    {
        "code": "EE",
        "name": "Estonia",
        "dial": "372"
    },
    {
        "code": "LU",
        "name": "Luxembourg",
        "dial": "352"
    },
    {
        "code": "ME",
        "name": "Montenegro",
        "dial": "382"
    },
    {
        "code": "MT",
        "name": "Malta",
        "dial": "356"
    },
    {
        "code": "IS",
        "name": "Iceland",
        "dial": "354"
    },
    {
        "code": "AD",
        "name": "Andorra",
        "dial": "376"
    },
    {
        "code": "LI",
        "name": "Liechtenstein",
        "dial": "423"
    },
    {
        "code": "MC",
        "name": "Monaco",
        "dial": "377"
    },
    {
        "code": "SM",
        "name": "San Marino",
        "dial": "378"
    },
    {
        "code": "IL",
        "name": "Israel",
        "dial": "972"
    },
    {
        "code": "VA",
        "name": "Holy See (Vatican City State)",
        "dial": "39"
    }
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
