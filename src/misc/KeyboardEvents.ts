const preventAndInvoke = (event: any, invoke?: () => void) => {
    event.preventDefault();
    if (invoke) invoke();
};

// https://stackoverflow.com/questions/28171741/select-all-ctrla-keyboard-button-not-working-for-input-filed-inside-the-html5
const isInInput = (event: any) => (event.target?.select ? true : false);

export const ctrlA = (event: any, invoke?: () => void) => {
    if (event.ctrlKey && event.code === 'KeyA' && !isInInput(event)) {
        preventAndInvoke(event, invoke);
    }
};

export const ctrlR = (event: any, invoke?: () => void) => {
    // shit === false, to keep electron force reload option in dev mode
    if (event.ctrlKey && event.shiftKey === false && event.code === 'KeyR') {
        preventAndInvoke(event, invoke);
    }
};

export const ctrlX = (event: any, invoke?: () => void) => {
    if (event.ctrlKey && event.code === 'KeyX' && !isInInput(event)) {
        preventAndInvoke(event, invoke);
    }
};

export const ctrlC = (event: any, invoke?: () => void) => {
    if (event.ctrlKey && event.code === 'KeyC' && !isInInput(event)) {
        preventAndInvoke(event, invoke);
    }
};

export const ctrlV = (event: any, invoke?: () => void) => {
    if (event.ctrlKey && event.code === 'KeyV' && !isInInput(event)) {
        preventAndInvoke(event, invoke);
    }
};

export const F5 = (event: any, invoke?: () => void) => {
    if (event.code === 'F5') {
        preventAndInvoke(event, invoke);
    }
};

export const F2 = (event: any, invoke?: () => void) => {
    if (event.code === 'F2') {
        preventAndInvoke(event, invoke);
    }
};

export const Escape = (event: any, invoke?: () => void) => {
    if (event.code === 'Escape') {
        preventAndInvoke(event, invoke);
    }
};

export const Delete = (event: any, invoke?: () => void) => {
    if (event.code === 'Delete' && !isInInput(event)) {
        preventAndInvoke(event, invoke);
    }
};

// type Invoke = () => void;

// export const keyboardEvents = (event: any) => {
//     const wrap = (code: string, invoke?: Invoke) => {
//         if (event.code === code) preventAndInvoke(event, invoke);
//     };

//     return {
//         onDelete: (invoke?: Invoke) => wrap('Delete', invoke),
//         onEscape: (invoke?: Invoke) => wrap('Escape', invoke)
//     };
// };
