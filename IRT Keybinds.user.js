import IRF from 'internet-roadtrip-framework';
import _ from 'lodash';
// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     0.3
// @description Adds keybinds to Internet Roadtrip
// @author      LoG42
// @license     MIT
// @grant       GM_addStyle
// @match       https://neal.fun/internet-roadtrip/
// @run-at      document-start
// @require     https://cdn.jsdelivr.net/npm/internet-roadtrip-framework@0.4.1-beta
// @require     https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// ==/UserScript==

(async () => {  
    if (!IRF.isInternetRoadtrip) return;

    const optionsBody = await IRF.dom.options;
    const chatVDOM = await IRF.vdom.chat;
    const containerVDOM = await IRF.vdom.container;
    const mapVDOM = await IRF.vdom.map;
    const optionsVDOM = await IRF.vdom.options;
    const radioVDOM = await IRF.vdom.radio;
    const wheelVDOM = await IRF.vdom.wheel;

    GM_addStyle(`
#input-device {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    #the-unhider {
        width: 30%;
        height: 30vh;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        #input-element {
            border-radius: 9999px;
            opacity: 0;
        }
    }

    #the-unhider:hover #input-element {
        opacity: 1;
    }
}
    `)

    const inputDevice = document.createElement('div');
    inputDevice.id = 'input-device';
    document.body.appendChild(inputDevice);

    const unHider = document.createElement('div');
    unHider.id = 'the-unhider';
    inputDevice.appendChild(unHider);


    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = 'input-element'
    inputElement.readOnly = true;

    unHider.appendChild(inputElement);

    inputElement.addEventListener('keydown', handler);

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
                break;
            case 'KeyT':
                chatVDOM.methods.toggleChat();
                break;
            case 'Backquote':
                if (e.key === '~') {
                    chatVDOM.methods.openDiscord();
                }
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
        const options = optionsBody.getElementsByClassName('option');
        const optionsSorted = _.sortBy(options,function (option) {return getRotation(option);})
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

    const tab = await IRF.ui.panel.createTabFor(GM.info, {
        tabName: 'Keybinds',
        className: 'keybinds-tab'
    });

    const tabStyle = document.createElement('style');
    tabStyle.textContent = `
    .keybinds-tab .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    
        input[type=text] {
            padding: 0.35rem 1rem;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 999px;
            background: transparent;
            color: rgb(255, 255, 255);
            font-size: 0.9rem;
            font-family: inherit;
            transition: 0.2s;
            white-space: nowrap;
        }
    }
    `
    tab.container.appendChild(tabStyle);

    const testRow = document.createElement('div');
    testRow.classList.add('row');

    const labelOne = document.createElement('label');
    labelOne.textContent = 'hehee';

    const buttonOne = document.createElement('input')
    buttonOne.type = 'text';
    buttonOne.readOnly = true;
    
    tab.container.appendChild(testRow);
    testRow.appendChild(labelOne);
    testRow.appendChild(buttonOne);
})();