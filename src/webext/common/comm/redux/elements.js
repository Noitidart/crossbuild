// ACTIONS and REDUCER
const ADD_ELEMENT = 'ADD_ELEMENT';
let nextelementid = 0;
export function addElement(portid, name, wanted) {
    // wanted array of dotpaths, to deepAccessUsingString on redux store/state
    return {
        type: ADD_ELEMENT,
        portid,
        name,
        id: (nextelementid++).toString(), // toString because it is used as a key in react - crossfile-link3138470
        wanted
    }
}

const REMOVE_ELEMENT = 'REMOVE_ELEMENT';
export function removeElement(id) {
    return {
        type: REMOVE_ELEMENT,
        id
    }
}

export default function elements(state=[], action) {
    let type;
    ({type, ...action} = action);
    switch(type) {
        case ADD_ELEMENT: {
            let element = action;
            return [...state, element];
        }
        case REMOVE_ELEMENT: {
            let { id } = action;
            return state.filter(element => element.id !== id);
        }
        default:
            return state;
    }
}