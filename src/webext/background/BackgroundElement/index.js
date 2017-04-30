import React, { Component, PropTypes } from 'react'

import BrowserAction from './BrowserAction'

export default class BackgroundElement extends Component {
    static propTypes = {
        core: PropTypes.object,
        browser_action: PropTypes.object
    }
    render() {
        console.log('in renderof BackgroundElement');
        let { browser_action } = this.props;
        return (
            <div>
                <BrowserAction {...browser_action} />
            </div>
        )
    }
}