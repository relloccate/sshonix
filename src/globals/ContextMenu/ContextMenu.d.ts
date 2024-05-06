export type Options = {
    x: number;
    y: number;
    items: {
        text: string;
        event(): Function;
    }[];
};
