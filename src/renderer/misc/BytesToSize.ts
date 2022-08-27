export default (bytes: number, merged: boolean = false) => {
    if (bytes === 0) {
        return {
            size: 0,
            mark: 'B'
        };
    }

    const marks = ['B', 'KB', 'MB', 'GB', 'TB'];
    const size = Math.floor(Math.log(bytes) / Math.log(1024));
    const fixed = Number((bytes / Math.pow(1024, size)).toFixed(2));

    if (merged) return `${fixed} ${marks[size]}`;

    return {
        size: fixed,
        mark: marks[size]
    };
};
