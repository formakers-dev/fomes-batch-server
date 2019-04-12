const getTimestamp = () => {
    return new Date().toISOString();
};

const info = (tag, ...args) => {
    console.log(`[${getTimestamp()}][${tag}]`, ...args);
};

const error = (tag, ...args) => {
    console.error(`\e[0;31m[${getTimestamp()}][${tag}]`, ...args, '\e[0m');
};

module.exports = {info, error};