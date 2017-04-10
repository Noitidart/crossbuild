import React, { Component } from 'react'
import { render } from 'react-dom'

import './index.css'

console.error('ENTER');

class App extends Component {
    render() {
        let arr = [<span>1</span>, <span>2</span>, <span>3</span>];
        return (
            <div>
                {arr}
            </div>
        );
    }
}

render(<App/>, document.getElementById('root'))
