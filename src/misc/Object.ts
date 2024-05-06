export const deproxy = (object: any) => {
    return JSON.parse(JSON.stringify(object));
};
