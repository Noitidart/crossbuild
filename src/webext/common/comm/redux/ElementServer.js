import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { deepAccessUsingString } from '../../all'

const DOTPATH_AS_PATT = /(.+) as (.+)$/m;
function buildWantedState(wanted, state) {
    console.log('state:', state, 'wanted:', wanted);
    let wanted_state = {};
    for (let dotpath of wanted) {
        let name;
        if (DOTPATH_AS_PATT.test(dotpath)) {
            // ([, dotpath, name] = DOTPATH_AS_PATT.exec(dotpath));
            let matches = DOTPATH_AS_PATT.exec(dotpath);
            dotpath = matches[1];
            name = matches[2];
        } else {
            name = dotpath.split('.');
            name = name[name.length-1];
        }
        wanted_state[name] = deepAccessUsingString(state, dotpath, 'THROW');
    }
    return wanted_state;
}

const ElementServer = connect(
    function(state, ownProps) {
        let { wanted } = ownProps;
        return {
            state: buildWantedState(wanted, state)
        }
    }
)(class ElementServerClass extends Component {
    static propTypes = {
        portid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        wanted: PropTypes.arrayOf(PropTypes.string).isRequired,
        state: PropTypes.any.isRequired // supplied by the redux.connect
    }
    render() {
        // let { state } = this.props;
        // callIn(portid, 'setElementState', {id, state}); // TODO:
        return <div />;
    }
});

export default ElementServer;