// ==UserScript==
// @name        Internet Roadtrip Keybinds
// @namespace   http://tampermonkey.net/
// @version     1.1.1
// @description Adds keybinds to Internet Roadtrip
// @author      LoG42
// @license     MIT
// @grant       GM.addStyle
// @grant       GM.info
// @grant       GM.getValue
// @grant       GM.setValue
// @match       https://neal.fun/internet-roadtrip/
// @run-at      document-start
// @icon        https://files.catbox.moe/o5iu1d.png
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
        bandwagon: 'Bandwagon'
    };
    /**
     * @type {Object.<string,HTMLInputElement>} keybindInputStorage
     */
    let keybindInputStorage = {}
    /**
     * @type {Object.<string,string>} settings
     */
    let settings = {}
    for (const option in defaultKeybinds) {
        if (Object.hasOwnProperty.call(defaultKeybinds, option)) {
            settings[option] = await GM.getValue(option,defaultKeybinds[option]);
        }
    }

    document.onkeydown = function(e) {
        handler(e);
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */

    function handler(e) {
        if (e.target !== document.body) {
            return;
        }
        let formattedKeyEvent = formatKeyEvent(e);
        switch (formattedKeyEvent) {
            case settings.radioPower:
                radioVDOM.methods.togglePower();
                break;
            case settings.seek:
                radioVDOM.methods.seek();
                break;
            case settings.honk:
                wheelVDOM.methods.onHonkClick();
                break;
            case settings.mapExpand:
                mapVDOM.methods.toggleExpand();
                break;
            case settings.radioVolDown:
                volSetter(radioVDOM.data.volume - 5);
                break;
            case settings.radioVolUp:
                volSetter(radioVDOM.data.volume + 5);
                break;
            case settings.bandwagon:
                bandwagon();
                break;
            case settings.toggleChat:
                chatVDOM.methods.toggleChat();
                break;
            case settings.openDiscord:
                chatVDOM.methods.openDiscord();
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
        const formattedKey = formatKeyEvent(e)
        const optionSelect = [
            'option0',
            'option1',
            'option2',
            'option3',
            'option4',
            'option5',
            'option6',
            'option7',
            'option8',
            'option9',
            'option10',
            'option11'
        ];
        const options = optionsBody.getElementsByClassName('option');
        const optionsSorted = _.sortBy(options,function (option) {return getRotation(option);})
        // if (optionSelect.hasOwnProperty(e.code)){
        //     if (optionsSorted[optionSelect[e.code]]) {
        //         optionsSorted[optionSelect[e.code]].click();
        //         return;
        //     }
        // }

        for (let i = 0; i < optionSelect.length; i++) {
            const element = optionSelect[i];
            if (settings[element] === formattedKey) {
                if (optionsSorted[i]) {
                    optionsSorted[i].click();
                    return;
                }
            }
        }

        switch (formattedKey) {
            case settings.left:
                if (optionsSorted[0]) {
                    optionsSorted[0].click();
                }
                break;
            case settings.right:
                if (optionsSorted.at(-1)) {
                    optionsSorted.at(-1).click();
                }
                break;
            case settings.forward: {
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
    
        input[type=text], button {
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
    
        input[type=text]:hover, button:hover {
            background: rgba(68, 68, 170, 0.1);
        }
    
        input[type=text]:focus, button:active {
            border: 1px solid rgb(68, 68, 170);
            background: rgb(68, 68, 170);
        }
    
        input[type=text].conflict {
            color:red;
        }
    }
    `
    tab.container.appendChild(tabStyle);
    let instructionsRow = document.createElement('div');
    instructionsRow.classList.add('row');
    let instructionsLabel = document.createElement('ul');
    instructionsLabel.innerHTML = '<li>Set keybinds by clicking on their button and then typing the keybind</li><li>Reset keybinds by double clicking on their button</li><li>Reset All button at the bottom</li><li>Type Escape on a keybind button to unbind keybinds</li><li>Conflicts are marked in red text</li><li>The text on the button after you type in the keybind may be different from what you typed. This is due to keyboard differences. The keybind should still be what you typed.</li>';
    instructionsRow.appendChild(instructionsLabel);
    tab.container.appendChild(instructionsRow);
    tab.container.appendChild(document.createElement('hr'));
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
            keybindInput.onkeydown = async function(e){
                await updateKeybind(keybindInput,key,e);
            }

            keybindInput.ondblclick = async function(){
                await resetKeybind(keybindInput,key);
            }
            
            tab.container.appendChild(keybindRow);
            keybindRow.appendChild(labelName);
            keybindRow.appendChild(keybindInput);
            keybindInputStorage[key] = keybindInput;
        }
    }
    checkForConflicts();
    let resetRow = document.createElement('div');
    resetRow.classList.add('row');
    let resetAllButton = document.createElement('button');
    resetAllButton.textContent = 'Reset All'
    resetAllButton.onclick = async function() {
        if(confirm('Are you sure you want to reset all keybinds? THIS IS IRREVERSIBLE!')) {
            await resetAll();
        }
    };
    resetRow.appendChild(resetAllButton);
    tab.container.appendChild(resetRow);

    /**
     * 
     * @param {HTMLInputElement} keybindInput 
     * @param {string} key 
     * @param {KeyboardEvent} e 
     */
    async function updateKeybind(keybindInput,key,e) {
        if (e.code === 'Escape') {
            settings[key] = 'Not Bound';
            await GM.setValue(key,settings[key])
            keybindInput.value = settings[key];
            checkForConflicts();
            return;
        }
        const formattedEvent = formatKeyEvent(e);
        settings[key] = formattedEvent;
        await GM.setValue(key,settings[key])
        keybindInput.value = settings[key];
        checkForConflicts();
    }

    /**
     * 
     * @param {HTMLInputElement} keybindInput 
     * @param {string} key 
     */
    async function resetKeybind(keybindInput,key) {
        const ogSetting = defaultKeybinds[key];
        settings[key] = ogSetting;
        await GM.setValue(key,ogSetting);
        keybindInput.value = ogSetting;
        checkForConflicts();
    }

    async function resetAll() {
        for (const key in keybindInputStorage) {
            if (Object.hasOwnProperty.call(keybindInputStorage, key)) {
                const keybindInput = keybindInputStorage[key];
                await resetKeybind(keybindInput,key)
            }
        }
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    function formatKeyEvent(e) {
        let shift = e.shiftKey ? 'Shift' : '';
        let meta = e.metaKey ? 'Meta' : '';
        let ctrl = e.ctrlKey ? 'Ctrl' : '';
        let alt = e.altKey ? 'Alt' : '';
        
        let arr = [ctrl,alt,shift,meta,(['Control','Shift','Alt','Meta'].some(sub => e.code.startsWith(sub)) ? '' : e.code)];
        
        return arr.filter((word) => word.length > 0).join(' + ');
    }

    function checkForConflicts() {
        /**
         * @type {Map<string,HTMLInputElement>} conflictMap
         */
        let conflictMap = new Map()

        for (const key in keybindInputStorage) {
            if (Object.hasOwnProperty.call(keybindInputStorage, key)) {
                const keybindInput = keybindInputStorage[key];
                keybindInput.classList.remove('conflict');
                if (keybindInput.value === 'Not Bound') {
                    continue;
                }
                if (conflictMap.has(keybindInput.value)) {
                    keybindInput.classList.add('conflict')
                    conflictMap.get(keybindInput.value).classList.add('conflict')
                } else {
                    conflictMap.set(keybindInput.value,keybindInput);
                }
            }
        }
    }
})();