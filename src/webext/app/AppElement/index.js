import React, { Component, PropTypes } from 'react'

export default class AppElement extends Component {
    static propTypes = {
        core: PropTypes.object,
        todos: PropTypes.array,
        visibility: PropTypes.string
    }
    render() {
        let { visibility } = this.props;
        return (
            <div>
                <div>
                    Visibility: <span>{visibility}</span>
                </div>
            </div>
        )
    }
}