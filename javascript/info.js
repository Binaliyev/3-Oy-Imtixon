const elCountryInfoBox = document.querySelector(".js-info-box");
const elCountryBorderContrysList = document.querySelector(".js-border-coutry-list");
const elLocationBtn = document.querySelector(".js-location-btn");
const elHeader = document.querySelector(".js-header");
const elDarkModeTitle = document.querySelector(".js-dark-mode-title");
const handleGetCountryFn = async api => {
    try {
        const request = await fetch(api);
        if (request.status == 200) {
            const response = await request.json();
            await handleRenderCountryFn(response)
        }
    } catch (error) {
        return alert(error.message)
    }
}
const handleRenderBorderCountrys = async arr => {
    elCountryBorderContrysList.innerHTML = "";
    const docFragment = document.createDocumentFragment();
    if (arr?.length) {
        arr.forEach((countrys) => {
            const checkMode = (getItem("mode") ? JSON.parse(getItem("mode")) : { light: true, dark: false });
            const newListItem = document.createElement("li");
            newListItem.classList.add("border-country-item");
            if (checkMode.light && !checkMode.dark) {
                newListItem.classList.add("light");
                newListItem.classList.remove("dark");
            };
            if (!(checkMode.light && !checkMode.dark)) {
                newListItem.classList.add("dark");
                newListItem.classList.remove("light");
            };
            newListItem.textContent = countrys;
            docFragment.append(newListItem);
        })
        elCountryBorderContrysList.append(docFragment);
    } else {
        const newListItem = document.createElement("li");
        newListItem.textContent = "This country has no bordering countries";
        elCountryBorderContrysList.append(newListItem);
    }
}
async function handleRenderCountryFn([country]) {
    elCountryInfoBox.querySelector(".js-country-flag-img").src = country.flags.png? country.flags.png : "/assets/img/not_found.jpg";
    elCountryInfoBox.querySelector(".js-coutry-name").textContent = country.name.common;
    elCountryInfoBox.querySelector(".js-coutry-native-name").textContent = country.name.official;
    elCountryInfoBox.querySelector(".js-coutry-population").textContent = country.population;
    elCountryInfoBox.querySelector(".js-coutry-region").textContent = country.region;
    elCountryInfoBox.querySelector(".js-country-capital").textContent = country.capital;
    elCountryInfoBox.querySelector(".js-country-subregion").textContent = country.subregion? country.subregion : "Not";
    elCountryInfoBox.querySelector(".js-country-domain").textContent = country.tld? country.tld : "Not";
    elCountryInfoBox.querySelector(".js-country-currencies").textContent = Object.values(country.currencies)[0].name;
    elCountryInfoBox.querySelector(".js-country-languages").textContent = Object.values(country.languages)[0];
    await handleRenderBorderCountrys(country.borders);
}

const handleControlModeFn = ({ light, dark }) => {
    if (light && !dark) {
        elCountryInfoBox.style.color = "#000";
        elLocationBtn.classList.add("light");
        elLocationBtn.classList.remove("dark");
        elHeader.classList.add("light");
        elHeader.classList.remove("dark");
        document.body.style.background = "#eaeaea";
    };
    if (!light && dark) {
        elCountryInfoBox.style.color = "#fff";
        elLocationBtn.classList.add("dark");
        elLocationBtn.classList.remove("light");
        elHeader.classList.add("dark");
        elHeader.classList.remove("light");
        document.body.style.background = "#202c36";
    };
    const countryId = getItem("id");
    handleGetCountryFn(COUNTRYS_API + `/name/${countryId}`);
}
handleControlModeFn((getItem("mode") ? JSON.parse(getItem("mode")) : { light: true, dark: false }));
const countryId = getItem("id");
if (countryId) {
    handleGetCountryFn(COUNTRYS_API + `/name/${countryId}`);
} else {
    window.location = "/index.html";
}
elLocationBtn.addEventListener("click", () => {
    elCountryInfoBox.innerHTML = "";
    removeItem("id");
    window.location = "/index.html";
})
elDarkModeTitle.addEventListener("click", () => {
    if (getItem("mode")) setItem("mode", { light: !(JSON.parse(getItem("mode")).light), dark: !(JSON.parse(getItem("mode")).dark) });
    if (!getItem("mode")) setItem("mode", { light: false, dark: true });
    handleControlModeFn(JSON.parse(getItem("mode")));
});