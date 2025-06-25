// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     0.1.1
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

    document.addEventListener('keydown', handler);

    function handler(e) {
        switch (e.code) {
            case 'KeyM':
                radioBody.querySelector('.power-button').click();
                break;
            case 'KeyS':
                radioBody.querySelector('.control-button').click();
                break;
            case 'Space':
                wheelBody.querySelector('.wheel-click-area').click();
            default:
                break;
        }

        switch (e.key) {
            case '<':
                volSetter(radioVDOM.data.volume - 5);
                break;
            case '>':
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
            '1': 0,
            '2': 1,
            '3': 2,
            '4': 3,
            '5': 4,
            '6': 5,
            '7': 6,
            '8': 7,
            '9': 8,
            '10': 9,
            '-': 10,
            '=': 11
        };
        const options = containerBody.getElementsByClassName('option');
        const optionsSorted = _.sortBy(options,[function (option) { return getRotation(option);}])
        if (optionSelect.hasOwnProperty(e.key)){
            if (optionsSorted[optionSelect[e.key]]) {
                optionsSorted[optionSelect[e.key]].click();
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