const setItem = (key, val) => window.localStorage.setItem(key, (typeof val == "object"? JSON.stringify(val): val));
const getItem = key => window.localStorage.getItem(key);
const removeItem = key => window.localStorage.removeItem(key);
const COUNTRYS_API = "https://restcountries.com/v3.1";