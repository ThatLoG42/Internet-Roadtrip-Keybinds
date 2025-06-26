// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     0.1.3
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
    if (!IRF.isInternetRoadtrip) {
        return;
    }
    const radioVDOM = await IRF.vdom.radio;
    const radioBody = await IRF.dom.radio;
    const wheelBody = await IRF.dom.wheel;
    const containerBody = await IRF.dom.container;
    const mapBody = await IRF.dom.map;

    document.addEventListener('keydown', handler);

    function handler(e) {
        switch (e.code) {
            case 'KeyR':
                radioBody.querySelector('.power-button').click();
                break;
            case 'KeyS':
                radioBody.querySelector('.control-button').click();
                break;
            case 'Space':
                wheelBody.querySelector('.wheel-click-area').click();
                break;
            case 'KeyE':
                mapBody.querySelector('.expand-button').click();
                break;
            case 'Comma':
                volSetter(radioVDOM.data.volume - 5);
                break;
            case 'Period':
                volSetter(radioVDOM.data.volume + 5);
                break;
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
        const options = containerBody.getElementsByClassName('option');
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
})();