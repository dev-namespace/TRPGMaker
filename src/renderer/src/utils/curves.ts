export default {
    linear: (t: number, duration: number) => {
        return t / duration;
    },
    "ease-in": (t: number, duration: number) => {
        return (t / duration) * (t / duration);
    },
    "ease-out": (t: number, duration: number) => {
        return (t / duration) * (2 - t / duration);
    },
};
