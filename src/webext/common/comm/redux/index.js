// TODO: figure out how to make redux-offline only persist some keys, like there is no reason to persist messages

import React, { Component, PropTypes } from 'react'
import { combineReducers, createStore } from 'redux'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
// import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
// import { offline } from 'redux-offline'
// import offlineConfigDefault from 'redux-offline/lib/defaults'
// import thunk from 'redux-thunk'


import * as reducers from './flows'

import { addElement } from './flows/elements'

import ElementServer from './ElementServer'

// const store = createStore(reducer, undefined, compose(applyMiddleware(thunk), offline(offlineConfigDefault)));
// const store = createStore(combineReducers(reducers), undefined, compose(applyMiddleware(thunk), offline(offlineConfigDefault)));
// const store = createStore(combineReducers(reducers), undefined, applyMiddleware(thunk));
const store = createStore(combineReducers(reducers));

// App is proxy server
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

function runProxyServer() {
    render(<Provider store={store}><App/></Provider>, document.getElementById('root'));
}

export function renderProxied(component, container, wanted) {
    // component - react class
    // container - dom target - document.getElementById('root')
    // wanted - wanted state
    store.dispatch(addElement('todo', component.name, wanted));

}

runProxyServer();

export default renderProxied;