/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                kanit: ["Kanit_400Regular", "sans-serif"],
                kanitsemibold: ["Kanit_600SemiBold", "sans-serif"],
                kanitbold: ["Kanit_700Bold", "sans-serif"],
            },
        },
    },
    plugins: [],
};
