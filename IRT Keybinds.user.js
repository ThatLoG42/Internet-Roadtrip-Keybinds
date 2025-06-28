// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     0.2.1.3
// @description Adds keybinds to Internet Roadtrip
// @author      LoG42
// @license     MIT
// @match       https://neal.fun/internet-roadtrip/
// @run-at      document-start
// @require     https://cdn.jsdelivr.net/npm/internet-roadtrip-framework@0.4.1-beta
// @require     https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// ==/UserScript==
import * as IRF from 'internet-roadtrip-framework';
import _ from 'lodash';

(async () => {
    if (!IRF.isInternetRoadtrip) return;

    const optionsBody = await IRF.dom.options;
    const containerVDOM = await IRF.vdom.container;
    const mapVDOM = await IRF.vdom.map;
    const optionsVDOM = await IRF.vdom.options;
    const radioVDOM = await IRF.vdom.radio;
    const wheelVDOM = await IRF.vdom.wheel;

    document.addEventListener('keydown', handler);

    function handler(e) {
        switch (e.code) {
            case 'KeyR':
                radioVDOM.methods.togglePower();
                break;
            case 'KeyS':
                radioVDOM.methods.seek();
                break;
            case 'Space':
                wheelVDOM.methods.onHonkClick();
                break;
            case 'KeyE':
                mapVDOM.methods.toggleExpand();
                break;
            case 'Comma':
                volSetter(radioVDOM.data.volume - 5);
                break;
            case 'Period':
                volSetter(radioVDOM.data.volume + 5);
                break;
            case 'Slash':
                if (e.key === '?') {
                    bandwagon();
                }
            default:
                chooseOption(e);
        }
    }

    function volSetter(wantedVol) {
        const newVol = Math.min(Math.max(wantedVol, 0),100);
        const rotation = (27/10*newVol-135)*(Math.PI/180);
        radioVDOM.methods.updateVolumeFromAngle(-Math.PI/2 + rotation);
    }

    function chooseOption(e) {
        const optionSelect = {
            'Digit1': 0,
            'Digit2': 1,
            'Digit3': 2,
            'Digit4': 3,
            'Digit5': 4,
            'Digit6': 5,
            'Digit7': 6,
            'Digit8': 7,
            'Digit9': 8,
            'Digit0': 9,
            'Minus': 10,
            'Equal': 11
        };
        const options = optionsBody.getElementsByClassName('option');
        const optionsSorted = _.sortBy(options,[function (option) { return getRotation(option);}])
        if (optionSelect.hasOwnProperty(e.code)){
            if (optionsSorted[optionSelect[e.code]]) {
                optionsSorted[optionSelect[e.code]].click();
                return;
            }
        }
        switch (e.code) {
            case 'KeyA':
                if (optionsSorted[0]) {
                    optionsSorted[0].click();
                }
                break;
            case 'KeyD':
                if (optionsSorted.at(-1)) {
                    optionsSorted.at(-1).click();
                }
                break;
            case 'KeyW': {
                let middle = _.minBy(optionsSorted,function(option) {return Math.abs(getRotation(option));})
                if (middle) {
                    middle.click();
                }
            }
                break;
            default:
                break;
        }
    }

    function getRotation(elem){
        if (elem.style.rotate) {
            const re = new RegExp('.*(?=deg)')
            return parseFloat(elem.style.rotate.match(re)[0]);
        }
        return null;
    }

    function bandwagon() {
        const curVotes = containerVDOM.data.voteCounts;
        const popOption = parseInt(_.maxBy(Object.keys(curVotes), (o) => curVotes[o]));
        try {
            switch (popOption) {
                case -2:
                    wheelVDOM.methods.onHonkClick();
                    break;
                case -1:
                    radioVDOM.methods.seek();
                default:
                    optionsVDOM.methods.vote(popOption);
                    break;
            }
            console.log(`Joined the bandwagon for option ${popOption}.`);
        } catch (error) {
            console.log("Couldn't bandwagon.");
        }
    }
})();