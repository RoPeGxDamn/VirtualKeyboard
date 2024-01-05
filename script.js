const Keyboard = {
    elements:{
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers:{
        oninput: null,
        onclose: null
    }, 

    properties: {
        value: "",
        capsLock: false,
        language: 'ru',
        shift: false,
        light: false,
        shiftRu: '!"№;%:?*()_+',
        shiftEn: '!@#$%^&*()_+',
        sound: true
    },

    init(){
        //Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        //Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());
        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        //Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        //Automatically use keyboard for elemernts with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });

        
    },

    _createKeys(){
        const fragment = document.createDocumentFragment();
        
        let area = document.querySelector('.use-keyboard-input');
        
        let keyLayout = this.properties.language === 'ru' ? 
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace", 
        "[","ё", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ","]",
        "caps", "{", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "}", "enter",
            "done", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ",", ".", "?",
                "<", "space", "shift", "en/ru", ">", "light", "speech", "sound"] :
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
                "[","q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "]",
        "caps", "{", "a", "s", "d", "f", "g", "h", "j", "k", "l", "}", "enter",
                "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
                "<", "space", "shift", "en/ru", ">", "light", "speech", "sound"];

        //Create HTML for an icon
        const createIconHTML = (icon_name) =>{
            return `<i class="material-icons">${icon_name}</i>`;
        }
        
        keyLayout.forEach((key, index) => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "]", "enter", "?"].indexOf(key) !== -1;

            //Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");
            if(key.match(/[0-9]/ig) || key.match(/[=-]/ig)){
                keyElement.classList.add("number");
            }

            switch(key){

                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () =>{
                        let pos = doGetCaretPosition(area);

                        this.properties.value = this.properties.value.substring(0, --pos);

                        this._triggerEvent("oninput");
                        document.querySelector('.use-keyboard-input').focus();
                    });
                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () =>{
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);

                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () =>{
                        this.properties.value += "\n";
                        this._triggerEvent("oninput");
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () =>{
                        let pos = doGetCaretPosition(area);
                        let start = this.properties.value.substr(0, pos);
                        let end = this.properties.value.substr(pos, this.properties.value.length - 1);
    
                        setCaretPosition(area, pos);
                        this.properties.value = start + " " + end;

                        this._triggerEvent("oninput");
                        setCaretPosition(area, pos + 1);
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;
                
                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () =>{
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                case "<":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("arrow_back");

                    keyElement.addEventListener("click", ()=>{
                        let pos = doGetCaretPosition(area);
                        setCaretPosition(area, --pos);
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;

                case ">":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("arrow_forward");

                    keyElement.addEventListener("click", ()=>{
                        let pos = doGetCaretPosition(area);
                        setCaretPosition(area, ++pos);
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;

                case "en/ru":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("language");
                    keyElement.addEventListener("click", () =>{
                        this._toggleLanguage();
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_up");
                    keyElement.addEventListener("click", () =>{
                        this._toggleShift();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
                    document.querySelector('.use-keyboard-input').focus();

                    });

                    break;

                case "light":
                    keyElement.classList.add("keyboard__key--light", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML('highlight');
                    keyElement.addEventListener("click", () => {
                        this._toggleLight();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.light)
                    });

                    break;

                case "speech":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML('mic');
                    keyElement.addEventListener("click", speechRecognition);
                   
                    break;

                case "sound":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML('volume_off');
                    keyElement.addEventListener("click", ()=>{

                        this._toggleSound();
                    });

                    break;
                    
                default:
                    keyElement.textContent = key.toLowerCase();
                    keyElement.addEventListener('transitionend', removeTransition);
                    keyElement.setAttribute('data-key', '65');
                    keyElement.addEventListener("click", ()=>{
                        playSound();
                        let area = document.querySelector('.use-keyboard-input');
                        let pos = doGetCaretPosition(area);
                        let char = '';

                        if(!this.properties.capsLock){
                            if(!this.properties.shift){
                                char = key.toLowerCase();
                            }
                            else{
                                char = index < 12 ? (this.properties.language === 'en') ? this.properties.shiftEn[index] : this.properties.shiftRu[index] : key.toUpperCase();
                            }
                        }
                        else{
                            if(!this.properties.shift){
                                char = key.toUpperCase();
                            }
                            else{
                                char = index < 12 ? this.properties.language === 'en' ? this.properties.shiftEn[index] : this.properties.shiftRu[index] : key.toLowerCase();
                            }
                        }
    
                        let start = this.properties.value.substr(0, pos);
                        let end = this.properties.value.substr(pos, this.properties.value.length - 1);
    
                        setCaretPosition(area, pos);
                        this.properties.value = start + char + end;

                        this._triggerEvent("oninput");
                        setCaretPosition(area, pos + 1);
                        document.querySelector('.use-keyboard-input').focus();
                    });

                    break;
                
            }
            
            fragment.appendChild(keyElement);

            if(insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });
        
        return fragment;
    },

    _triggerEvent(handlerName){
        if(typeof this.eventHandlers[handlerName] == "function"){
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                if(this.properties.shift){
                    key.textContent = this.properties.capsLock ? key.textContent.toLowerCase() : key.textContent.toUpperCase();
                }
                else{
                    key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                }
            }
          }
    },

    _toggleLanguage() {
        if(this.properties.language === 'en'){
            this.properties.language = 'ru';
        }
        else if(this.properties.language === 'ru'){
            this.properties.language = 'en';
        }
        this.close();
        this.properties.shift = false;
        this.init();
        this.open();
        const elem = document.querySelector('.keyboard--hidden');
        elem.remove();
    },

    _toggleShift(){
        this.properties.shift = !this.properties.shift;
        for(const key of this.elements.keys){
            if(key.childElementCount === 0){
                if(this.properties.capsLock){
                    key.textContent = this.properties.shift ? key.textContent.toLowerCase() : key.textContent.toUpperCase();
                }
                else{
                    key.textContent = this.properties.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                }
            }
        }
        if(this.properties.language === 'ru'){
                const numbers = document.querySelectorAll(".number");
                for(let i = 0; i < numbers.length; i++){
                    if(this.properties.shift){
                        switch(numbers[i].innerHTML){
                            case '1':
                                numbers[i].textContent = '!';
                                break;
                            case '2':
                                numbers[i].innerHTML = '"';
                                break;
                            case '3':
                                numbers[i].innerHTML = '№';
                                break;
                            case '4':
                                numbers[i].innerHTML = ';';
                                break;
                            case '5':
                                numbers[i].innerHTML = '%';
                                break;
                            case '6':
                                numbers[i].innerHTML = ':';
                                break;
                            case '7':
                                numbers[i].innerHTML = '?';
                                break;
                            case '8':
                                numbers[i].innerHTML = '*';
                                break;
                            case '9':
                                numbers[i].innerHTML = '(';
                                break;
                            case '0':
                                numbers[i].innerHTML = ')';
                                break;
                            case '-':
                                numbers[i].innerHTML = "_";
                                break;
                            case '=':
                                numbers[i].innerHTML = '+';
                                break;
                        }
                    }
                    else{
                        if(i === numbers.length - 3){
                            numbers[i].innerHTML = '0';
                        }
                        else if(numbers[i].innerHTML === '_'){
                            numbers[i].innerHTML = '-';
                        }
                        else if(numbers[i].innerHTML === '+'){
                            numbers[i].innerHTML = '=';
                        }
                        else{
                            numbers[i].innerHTML = `${i + 1}`;
                        }
                    }
                }
        }
        else if(this.properties.language === 'en'){
                const numbers = document.querySelectorAll(".number");
                for(let i = 0; i < numbers.length; i++){
                    if(this.properties.shift){
                        switch(numbers[i].innerHTML){
                            case '1':
                                numbers[i].innerHTML = '!';
                                break;
                            case '2':
                                numbers[i].innerHTML = '@';
                                break;
                            case '3':
                                numbers[i].innerHTML = '#';
                                break;
                            case '4':
                                numbers[i].innerHTML = '$';
                                break;
                            case '5':
                                numbers[i].innerHTML = '%';
                                break;
                            case '6':
                                numbers[i].innerHTML = '^';
                                break;
                            case '7':
                                numbers[i].innerHTML = '&';
                                break;
                            case '8':
                                numbers[i].innerHTML = '*';
                                break;
                            case '9':
                                numbers[i].innerHTML = '(';
                                break;
                            case '0':
                                numbers[i].innerHTML = ')';
                                break;
                            case '-':
                                numbers[i].innerHTML = "_";
                                break;
                            case '=':
                                numbers[i].innerHTML = '+';
                                break;
                        }
                    }
                    else{
                        if(i === numbers.length - 3){
                            numbers[i].innerHTML = '0';
                        }
                        else if(numbers[i].innerHTML === '_'){
                            numbers[i].innerHTML = '-';
                        }
                        else if(numbers[i].innerHTML === '+'){
                            numbers[i].innerHTML = '=';
                        }
                        else{
                            numbers[i].innerHTML = `${i + 1}`;
                        }
                    }
                }
        }
    },

    _toggleLight(){
        this.properties.light = !this.properties.light;
        const keys = document.querySelectorAll('.keyboard__key');
        if(this.properties.light){
            for (let i = 0; i < keys.length; i++) {
                keys[i].style.cssText += `color: white;
                border: 3px white solid`;
            }
        }
        else{
            for (let i = 0; i < keys.length; i++) {
                keys[i].style.cssText += `color: #c7c0c0;
                border: none`;
            }
        }
        
    },

    _toggleSound(){
        this.properties.sound = !this.properties.sound;
    },

    open(initialValue, oninput, onclose){
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close(){
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden")
    }
};

    window.addEventListener("DOMContentLoaded", function() {
        Keyboard.init();
    });
    document.querySelector('.use-keyboard-input').onkeydown = triggerButton;

    function doGetCaretPosition(ctrl) {
        let caretPos = 0;
        if(document.selection){
            ctrl.focus();
            let sel = document.selection.createRange();
            sel.moveStart('character', -ctrl.value.length);
            caretPos = sel.text.length;
        }
        else if(ctrl.selectionStart || ctrl.selectionStart == '0'){
            caretPos = ctrl.selectionStart;
            return (caretPos);
        }
    }

    function setCaretPosition(ctrl, pos) {
        if(ctrl.setSelectionRange){
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        }
        else if(ctrl.createTextRange){
            let range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    function triggerButton(e) {
        const elems = document.querySelectorAll(".keyboard__key");
        let area = document.querySelector('.use-keyboard-input');
        let pos = doGetCaretPosition(area);
        let start = Keyboard.properties.value.substr(0, pos);
        let end = Keyboard.properties.value.substr(pos, Keyboard.properties.value.length - 1);

        setCaretPosition(area, pos);
        let keyLayout = [];

        if(Keyboard.properties.language === 'en'){
                keyLayout = [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
                        "[","q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "]",
                    "caps", "{", "a", "s", "d", "f", "g", "h", "j", "k", "l", "}", "enter",
                    "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
                            "<", "space", "shift", "en/ru", ">", "light", "speech"
                ];
        }
        else if(Keyboard.properties.language === 'ru'){
                    keyLayout = [
                        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace", 
                    "[","ё", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ","]",
                    "caps", "{", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "}", "enter",
                    "done", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ",", ".", "?",
                            "<", "space", "shift", "en/ru", ">", "light", "speech"
                ];
        }
            for (let i = 0; i < keyLayout.length; i++) {
                if(e.key === keyLayout[i]){
                    if(elems[i].textContent.toLowerCase() === e.key.toLowerCase()){
                        elems[i].style.background = 'red';
                        setTimeout(() => elems[i].style.background = '', 100);

                        Keyboard.properties.value = start + keyLayout[i] + end;

                        Keyboard._triggerEvent("oninput");
                        setCaretPosition(area, pos + 1);
                        document.querySelector('.use-keyboard-input').focus();
                    }
            }
        }
    }

    function removeTransition(e) {
        if (e.propertyName !== 'transform') return;
        e.target.classList.remove('playing');
      }
    
      function playSound(e) {
          if(Keyboard.properties.sound){
            const audio = document.querySelector(`audio[data-key="65"]`);
            const key = document.querySelector(`button[data-key="65"]`);
            if (!audio) return;
        
            key.classList.add('playing');
            audio.currentTime = 0;
            audio.play();
          }
        else{
            return;
        }
      }
    
      const keys = Array.from(document.querySelectorAll('.keyboard__key'));
      keys.forEach(key => key.addEventListener('transitionend', removeTransition));
      window.addEventListener('keydown', playSound);


    function speechRecognition() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        const recognition = new SpeechRecognition();
        recognition.interimResults = true;
        recognition.lang = Keyboard.properties.language === 'en' ? 'en-US': 'ru-Ru';
        
        recognition.addEventListener('result', e => {
        let transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
        
        if (e.results[0].isFinal) {
        console.log(transcript);
        use_keyboard_input.value += `${transcript}`;
        transcript = '';
        }
        });
        
        recognition.addEventListener('end', recognition.start);
        
        recognition.start();
    }
