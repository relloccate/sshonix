export default (latestUploadedVersion: string, currentAppVersion: string) => {
    let i, diff;
    let regExStrip0 = /(\.+)+$/;

    let segmentsA = latestUploadedVersion
        .replace(regExStrip0, '')
        .split('.')
        .map(segment => Number(segment));

    let segmentsB = currentAppVersion
        .replace(regExStrip0, '')
        .split('.')
        .map(segment => Number(segment));

    const needsToFillALength = segmentsB.length - segmentsA.length;
    const needsToFillBLength = segmentsA.length - segmentsB.length;

    if (needsToFillALength > 0) {
        for (let index = 0; index < needsToFillALength; index++) {
            segmentsA.push(0);
        }
    }

    if (needsToFillBLength > 0) {
        for (let index = 0; index < needsToFillBLength; index++) {
            segmentsB.push(0);
        }
    }

    let l = Math.max(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = segmentsA[i] - segmentsB[i];

        if (diff) {
            return diff > 0 ? true : false;
        }
    }

    return false;
};
