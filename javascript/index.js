const elCountrysTemp = document.querySelector(".js-countrys-temp").content;
const elSearchForm = document.querySelector(".js-search-form");
const elSearchContrysInput = elSearchForm.querySelector(".js-search-countrys-input");
const elSortContrysSelect = elSearchForm.querySelector(".js-sort-countrys-select");
const elFilterContrysRegionSelect = elSearchForm.querySelector(".js-filter-countrys-region-select");
const elCountrysList = document.querySelector(".js-countrys-list");
const elPaginationBox = document.querySelector(".js-pagination-box");
const elPaginationIncBtn = elPaginationBox.querySelector(".js-inc-btn");
const elPaginationTitle = elPaginationBox.querySelector(".js-pag-title");
const elPaginationDecBtn = elPaginationBox.querySelector(".js-dec-btn");
const elDarkModeTitle = document.querySelector(".js-dark-mode-title");
const elSubmitBtn = elSearchForm.querySelector(".js-submit-btn");
const elHeader = document.querySelector(".js-header");
const sortCountrysOBJ = {
    ["a-z"]: (a, b) => {
        const countrysNameCharCodeA = a.name.common.toLowerCase().charCodeAt(0);
        const countrysNameCharCodeB = b.name.common.toLowerCase().charCodeAt(0);
        if (countrysNameCharCodeA > countrysNameCharCodeB) return 1
        else return -1;
    },
    ["z-a"]: (a, b) => {
        const countrysNameCharCodeA = a.name.common.toLowerCase().charCodeAt(0);
        const countrysNameCharCodeB = b.name.common.toLowerCase().charCodeAt(0);
        if (countrysNameCharCodeA < countrysNameCharCodeB) return 1
        else return -1;
    },
    ["min-population"]: (a, b) => {
        const countrysPopulationA = Number(a.population);
        const countrysPopulationB = Number(b.population);
        if (countrysPopulationA > countrysPopulationB) return 1
        else return -1;
    },
    ["max-population"]: (a, b) => {
        const countrysPopulationA = Number(a.population);
        const countrysPopulationB = Number(b.population);
        if (countrysPopulationA < countrysPopulationB) return 1
        else return -1;
    },
}
const handleCountrysSearchFn = async (searc_countrys_arr, regex, searchValue) => {
    let filter_country;
    const result = searc_countrys_arr.filter(({ name, region }) => {
        filter_country = (searchValue == "" || name.common.match(regex)) && (elFilterContrysRegionSelect.value == "all" || region.toLowerCase().includes(elFilterContrysRegionSelect.value));
        return filter_country;
    });
    return result;
}
const handleGetCountrysFn = async (api, { search_check, start, end }, regex = "", searchValue = "") => {
    try {
        const request = await fetch(api);
        if (request.status == 200) {
            const response = await request.json();
            const renderArr = await response.slice((start ? start : 0), (end ? end : 100));
            if (search_check) {
                const searc_countrys_arr = (elSortContrysSelect.value ? renderArr.sort(sortCountrysOBJ[elSortContrysSelect.value]) : renderArr);
                const search = await handleCountrysSearchFn(searc_countrys_arr, regex, searchValue);
                await handleRenderCountrysFn(search, regex);
            }
            if (!search_check) await handleRenderCountrysFn(renderArr);
        }
    } catch (error) {
        return error.message
    }
};

async function handleRenderCountrysFn(arr, regex) {
    elCountrysList.innerHTML = "";
    const docFragment = document.createDocumentFragment();
    arr.forEach(({ name: { common }, region, flags: { png }, capital, population }) => {
        const clone = elCountrysTemp.cloneNode(true);
        const elCountrysListItems = clone.querySelector(".js-countrys-list-items");
        elCountrysListItems.dataset.id = common;
        const checkMode = (getItem("mode") ? JSON.parse(getItem("mode")) : { light: true, dark: false });
        if (checkMode.light && !checkMode.dark) {
            elCountrysListItems.classList.add("light");
            elCountrysListItems.classList.remove("dark");
        };
        if (!(checkMode.light && !checkMode.dark)) {
            elCountrysListItems.classList.add("dark");
            elCountrysListItems.classList.remove("light");
        };
        clone.querySelector(".js-countrys-img").src = png;
        if (regex && regex.source != "(?:)") clone.querySelector(".js-countrys-names-title").innerHTML = common.replaceAll(regex, match => `<mark>${match}</mark>`)
        else clone.querySelector(".js-countrys-names-title").textContent = common;
        clone.querySelector(".js-countrys-population-title").textContent = population;
        clone.querySelector(".js-countrys-region-title").textContent = region;
        clone.querySelector(".js-countrys-capital-title").textContent = capital;
        docFragment.append(clone);
    })
    elCountrysList.append(docFragment);
}
handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: false, start: 0, end: 100 });

let pageCount = 1;
const handlePaginationFn = evt => {
    if (evt?.target.matches(".js-inc-btn")) pageCount++;
    if (evt?.target.matches(".js-dec-btn")) pageCount--;
    elPaginationTitle.textContent = pageCount
    if (pageCount >= 3) {
        elPaginationIncBtn.disabled = true;
        elPaginationIncBtn.classList.add("dis-status");
    };
    if (pageCount > 1) {
        elPaginationDecBtn.disabled = false;
        elPaginationDecBtn.classList.remove("dis-status");
    }
    if (pageCount < 3) {
        elPaginationIncBtn.disabled = false;
        elPaginationIncBtn.classList.remove("dis-status");
    }
    if (pageCount <= 1) {
        elPaginationDecBtn.disabled = true;
        elPaginationDecBtn.classList.add("dis-status");
        elPaginationIncBtn.disabled = false;
        elPaginationIncBtn.classList.remove("dis-status");
    };
    if (pageCount < 2) {
        handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: false, start: 0, end: 100 });
        setItem("sliceOBJ", { start: 0, end: 100 });
    };
    if (pageCount == 2) {
        handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: false, start: 100, end: 200 });
        setItem("sliceOBJ", { start: 100, end: 200 });
    };
    if (pageCount > 2) {
        handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: false, start: 200, end: 251 });
        setItem("sliceOBJ", { start: 200, end: 251 });
    };
};

const handleControlModeFn = ({ light, dark }) => {
    if (light && !dark) {
        elSearchContrysInput.classList.add("light");
        elSearchContrysInput.classList.remove("dark");
        elSortContrysSelect.classList.add("light");
        elSortContrysSelect.classList.remove("dark");
        elFilterContrysRegionSelect.classList.add("light");
        elFilterContrysRegionSelect.classList.remove("dark");
        elPaginationIncBtn.classList.add("light");
        elPaginationIncBtn.classList.remove("dark");
        elPaginationTitle.classList.add("light");
        elPaginationTitle.classList.remove("dark");
        elPaginationDecBtn.classList.add("light");
        elPaginationDecBtn.classList.remove("dark");
        elSubmitBtn.classList.add("light");
        elSubmitBtn.classList.remove("dark");
        elHeader.classList.add("light");
        elHeader.classList.remove("dark");
        document.body.style.background = "#eaeaea";
    };
    if (!light && dark) {
        elSearchContrysInput.classList.add("dark");
        elSortContrysSelect.classList.add("dark");
        elFilterContrysRegionSelect.classList.add("dark");
        elPaginationIncBtn.classList.add("dark");
        elPaginationTitle.classList.add("dark");
        elPaginationDecBtn.classList.add("dark");
        elSubmitBtn.classList.add("dark");
        elSearchContrysInput.classList.remove("light");
        elSortContrysSelect.classList.remove("light");
        elFilterContrysRegionSelect.classList.remove("light");
        elPaginationIncBtn.classList.remove("light");
        elPaginationTitle.classList.remove("light");
        elPaginationDecBtn.classList.remove("light");
        elSubmitBtn.classList.remove("light");
        elHeader.classList.add("dark");
        elHeader.classList.remove("light");
        document.body.style.background = "#202c36";
    };
    handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: false, start: (getItem("sliceOBJ") ? JSON.parse(getItem("sliceOBJ")).start : 0), end: (getItem("sliceOBJ") ? JSON.parse(getItem("sliceOBJ")).end : 100) });
}
handleControlModeFn((getItem("mode") ? JSON.parse(getItem("mode")) : { light: true, dark: false }));

window.addEventListener("load", () => removeItem("sliceOBJ"));
elPaginationIncBtn.addEventListener("click", handlePaginationFn);
elPaginationDecBtn.addEventListener("click", handlePaginationFn);
elCountrysList.addEventListener("click", evt => {
    if (evt.target.matches(".js-countrys-list-items")) { setItem("id", evt.target.dataset.id); window.location = "/html/info.html" };
});
elDarkModeTitle.addEventListener("click", () => {
    if (getItem("mode")) setItem("mode", { light: !(JSON.parse(getItem("mode")).light), dark: !(JSON.parse(getItem("mode")).dark) });
    if (!getItem("mode")) setItem("mode", { light: false, dark: true });
    handleControlModeFn(JSON.parse(getItem("mode")));
});
elSearchForm.addEventListener("submit", evt => {
    evt.preventDefault();
    const searchInputVal = elSearchContrysInput.value?.trim();
    const regex = new RegExp(searchInputVal, "gi");
    handleGetCountrysFn(COUNTRYS_API + "/all", { search_check: true, start: (getItem("sliceOBJ") ? JSON.parse(getItem("sliceOBJ")).start : 0), end: (getItem("sliceOBJ") ? JSON.parse(getItem("sliceOBJ")).end : 100) }, regex, searchInputVal);
    elSearchContrysInput.value = "";
})






