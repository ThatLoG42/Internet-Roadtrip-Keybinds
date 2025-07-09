// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     0.3.2
// @description Adds keybinds to Internet Roadtrip
// @author      LoG42
// @license     MIT
// @grant       GM.addStyle
// @grant       GM.info
// @grant       GM.getValue
// @grant       GM.setValue
// @match       https://neal.fun/internet-roadtrip/
// @run-at      document-start
// @icon        https://files.catbox.moe/ip5hzt.png
// @require     https://cdn.jsdelivr.net/npm/internet-roadtrip-framework@0.4.1-beta
// @require     https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

// type hints
// import IRF from 'internet-roadtrip-framework';
// import _ from 'lodash';

(async () => { 
    if (!IRF.isInternetRoadtrip) return;

    const optionsBody = await IRF.dom.options;
    const chatVDOM = await IRF.vdom.chat;
    const containerVDOM = await IRF.vdom.container;
    const mapVDOM = await IRF.vdom.map;
    const optionsVDOM = await IRF.vdom.options;
    const radioVDOM = await IRF.vdom.radio;
    const wheelVDOM = await IRF.vdom.wheel;

    const defaultKeybinds = {
        option0: 'Digit1',
        option1: 'Digit2',
        option2: 'Digit3',
        option3: 'Digit4',
        option4: 'Digit5',
        option5: 'Digit6',
        option6: 'Digit7',
        option7: 'Digit8',
        option8: 'Digit9',
        option9: 'Digit0',
        option10: 'Minus',
        option11: 'Equal',
        forward: 'KeyW',
        left: 'KeyA',
        right: 'KeyD',
        seek: 'KeyS',
        honk: 'Space',
        radioPower: 'KeyR',
        radioVolDown: 'Comma',
        radioVolUp: 'Period',
        mapExpand: 'KeyE',
        toggleChat: 'KeyT',
        openDiscord: 'Shift + Backquote',
        bandwagon: 'Shift + Slash'
    };

    const keybindNames = {
        option0: 'Option 1',
        option1: 'Option 2',
        option2: 'Option 3',
        option3: 'Option 4',
        option4: 'Option 5',
        option5: 'Option 6',
        option6: 'Option 7',
        option7: 'Option 8',
        option8: 'Option 9',
        option9: 'Option 10',
        option10: 'Option 11',
        option11: 'Option 12',
        forward: 'Forward',
        left: 'Left',
        right: 'Right',
        seek: 'Seek',
        honk: 'Honk',
        radioPower: 'Power On/Off Radio',
        radioVolDown: 'Radio Volume Down',
        radioVolUp: 'Radio Volume Up',
        mapExpand: 'Expand/Contract Map',
        toggleChat: 'Open/Close Chat Window',
        openDiscord: 'Open Discord Server',
        bandwagon: 'Bandwagon',
    };

    const settings = {}
    for (const option in defaultKeybinds) {
        if (Object.hasOwnProperty.call(defaultKeybinds, option)) {
            settings[option] = await GM.getValue(option,defaultKeybinds[option]);
        }
    }

    await GM.addStyle(`
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
        width: 25%;
        height: 25vh;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        #input-element {
            border-radius: 9999px;
            border: 1px solid rgb(0,0,0);
            background: rgb(255,255,255);
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

    inputElement.onkeydown = function(e) {
        handler(e);
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */

    function handler(e) {
        let formattedKeyEvent = keyToFormat(e);
        switch (formattedKeyEvent) {
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

    /**
     * 
     * @param {KeyboardEvent} e 
     * @returns 
     */
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
    
        input[type=text]:hover {
            background: rgba(68, 68, 170, 0.1);
        }
    
        input[type=text]:focus {
            border: 1px solid rgb(68, 68, 170);
            background: rgb(68, 68, 170);
        }
    }
    `
    tab.container.appendChild(tabStyle);

    for (const key in keybindNames) {
        if (Object.hasOwnProperty.call(keybindNames, key)) {
            let keybindRow = document.createElement('div');
            keybindRow.classList.add('row');
        
            let labelName = document.createElement('label');
            labelName.textContent = keybindNames[key];
        
            let keybindInput = document.createElement('input')
            keybindInput.type = 'text';
            keybindInput.readOnly = true;
            keybindInput.value = settings[key]
            keybindInput.onkeydown = function(e){
                keybindInput.value = keyToFormat(e);
            }
            
            tab.container.appendChild(keybindRow);
            keybindRow.appendChild(labelName);
            keybindRow.appendChild(keybindInput);
            
        }
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    function keyToFormat(e) {
        let shift = e.shiftKey ? 'Shift' : '';
        let meta = e.metaKey ? 'Meta' : '';
        let ctrl = e.ctrlKey ? 'Ctrl' : '';
        let alt = e.altKey ? 'Alt' : '';
        
        let arr = [ctrl,alt,shift,meta,(['Control','Shift','Alt','Meta'].some(sub => e.code.startsWith(sub)) ? '' : e.code)];
        
        return `${arr.filter((word) => word.length > 0).join(' + ')}`;
    }
})();