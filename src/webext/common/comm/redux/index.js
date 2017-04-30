// TODO: figure out how to make redux-offline only persist some keys, like there is no reason to persist messages

import React, { Component, PropTypes } from 'react'
import { combineReducers, createStore } from 'redux'
import { render, unmountComponentAtNode } from 'react-dom'
import { Provider, connect } from 'react-redux'
// import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
// import { offline } from 'redux-offline'
// import offlineConfigDefault from 'redux-offline/lib/defaults'
// import thunk from 'redux-thunk'


import elements from './elements'
import { ADD_ELEMENT, REMOVE_ELEMENT } from './elements'

import { addElement } from './flows/elements'

import ElementServer from './ElementServer'
import Proxy from './Proxy'

// App is server that all proxies connect to
const App = connect(
    function(state) {
        return {
            elements: state.elements
        }
    }
)(class AppClass extends Component {
    // crossfile-link3138470
    static propTypes = {
        elements: PropTypes.array
    }
    render() {
        let { elements } = this.props;
        return (
            <div>
                { elements.map(element => <ElementServer key={element.id} {...element} />) }
            </div>
        )
    }
});

function unmountProxiedElement(id) {
    // TODO:
}

function renderProxiedElement(callInRedux, component, container, wanted) {
    // resolves with elementid - so dever can use with unmountProxiedElement(id)
    // component - react class
    // container - dom target - document.getElementById('root')
    // wanted - wanted state
    // store.dispatch(addElement('todo', component.name, wanted));

    let resolveWithId;

    let id; // element id
    let setState;

    callInRedux('addElement', { wanted }, function(aArg) {
        let { __PROGRESS } = aArg;

        if (__PROGRESS) {
            let { state } = aArg;
            if (id === undefined) {
                id = aArg.id;
                const setSetState = aSetState => {
                    setState = aSetState;
                    setState(() => state);
                };
                render(<Proxy Component={component} id={id} setSetState={setSetState} />, container);
                resolveWithId(id);
            } else {
                setState(() => state);
            }
        } else {
            // unmounted - server was shutdown by unregister()
            unmountComponentAtNode(container);
        }
    });

    return new Promise(resolve => resolveWithId = resolve);
}

export class Server {
    store = undefined
    constructor(reducers) {

        // this.store = createStore(reducer, undefined, compose(applyMiddleware(thunk), offline(offlineConfigDefault)));
        // this.store = createStore(combineReducers(reducers), undefined, compose(applyMiddleware(thunk), offline(offlineConfigDefault)));
        // this.store = createStore(combineReducers(reducers), undefined, applyMiddleware(thunk));
        this.store = createStore(combineReducers({ ...reducers, elements }));

        let container = document.createElement('div');
        container.classList.add('redux-server');
        document.appendChild(container);

        render(<Provider store={this.store}><App/></Provider>, container);
    }
    addElement() {

    }
}

export default renderProxiedElement;