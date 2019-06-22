"use strict";

const Message = function (content, id = undefined, isSending = false) {
    /*
    structure:
    div container
        div contents
            div loading
            div text
        br
     */

    // create elements
    const container = document.createElement("div");
    const contents = document.createElement("div");
    const loading = document.createElement("span");
    const text = document.createElement("span");
    const br = document.createElement("br");

    // assemble elements
    container.appendChild(contents);
    container.appendChild(br);
    contents.appendChild(loading);
    contents.appendChild(text);

    // add tags if given
    if (id) {
        contents.id = id;
    }
    text.innerHTML = content;
    loading.innerHTML = '<b>•</b><b>•</b><b>•</b>';
    container.classList.add("message-wrapper");
    contents.classList.add("content-container");
    loading.classList.add("content-loading");
    text.classList.add("content-text");

    // message is sent by me
    if (isSending) {
        // right float element
        contents.classList.add("content-mine");
        loading.remove();
        const clear = document.createElement('div');
        clear.classList.add('clear');
        container.appendChild(clear);
    }

    const optionIDs = [];

    function addOption(id) {
        optionIDs.push(id);
    }

    return {
        get id() {
            return id;
        },
        get HTML() {
            return container;
        },
        get loadingHTML() {
            return loading;
        },
        get textHTML() {
            return text;
        },
        get optionIDs() {
            return optionIDs;
        },
        get contentWrapper() {
            return contents;
        },
        get content() {
            return content;
        },
        addOption: addOption
    }
};

const Option = function (content, id, replyMessageID, onclick) {
    return {
        get content() {
            return content;
        },
        get id() {
            return id;
        },
        get replyMessageID() {
            return replyMessageID;
        }
    }
};

const MessageManager = function () {
    const messages = [];
    const options = [];

    let currentMessageID;
    const sentMessageIDs = [];
    const pendingMessageIDs = [];

    const displayingOptionIDs = [];
    const pendingOptionIDs = [];

    let messageIDused = 0;
    let optionIDused = 0;
    let container;
    let messageContainer;
    let optionContainer;

    let sendingActive = false;
    const typingSpeed = 20;

    let optionManager;

    function init() {
        container = document.getElementById("interactive-message");
        if (!container) {
            // if no container, create one
            container = document.createElement("div");
            container.id = "interactive-message";
            document.body.appendChild(container);
        }
        messageContainer = document.createElement("div");
        optionContainer = document.createElement("div");

        messageContainer.id = "message-container";
        optionContainer.id = "option-container";

        container.appendChild(messageContainer);
        container.appendChild(optionContainer);

        optionManager = new CircleManager(optionContainer.id);
        optionManager.onclick = onOptionClickCallback;
    }

    // parse JSON into properties
    function parseJSON(JSON) {
        for (let messageJSON of JSON.messages) {
            const message = parseMessage(messageJSON);
            pendingMessageIDs.push(message.id);
        }
    }

    function parseMessage(messageJSON) {
        // create message object
        const message = new Message(messageJSON.content, `message-${messageIDused++}`);

        // add options if any
        const optionJSON = messageJSON.option;
        if (optionJSON) {
            const option = parseOption(optionJSON);
            message.addOption(option.id);
        }

        messages.push(message);
        return message;
    }

    function parseOption(optionJSON) {
        const replyMessage = parseMessage(optionJSON.reply);
        const option = new Option(optionJSON.content, `option-${optionIDused++}`, replyMessage.id, onOptionClick);
        options.push(option);
        pendingOptionIDs.push(option.id);
        return option;
    }

    function onOptionClick(optionID) {
        const option = getOptionByID(optionID);
        if (option) {
            sendMessage(option.content);
            removeElement(optionID, displayingOptionIDs);
            adjustFlex();
            pendingMessageIDs.unshift(option.replyMessageID);
            if (!sendingActive) {
                receiveNextMessage();
            }
        }
    }

    function onOptionClickCallback(content) {
        for (const optionID of displayingOptionIDs) {
            const option = getOptionByID(optionID);
            if (option.content === content) {
                onOptionClick(option.id);
                return;
            }
        }
    }

    function adjustFlex() {
        function realAdjustFlex() {
            function constrain(min, max, num) {
                if (num > max) {
                    return max;
                } else if (num < min) {
                    return min;
                } else {
                    return num;
                }
            }

            const nMessages = sentMessageIDs.length;
            const nOptions = displayingOptionIDs.length;

            let percentPerMessage;
            if (nOptions === 0) {
                percentPerMessage = 100;
            } else if (nOptions === 1) {
                percentPerMessage = 40;
            } else if (nOptions === 2) {
                percentPerMessage = 30;
            } else if (nOptions === 3) {
                percentPerMessage = 25;
            } else if (nOptions <= 5) {
                percentPerMessage = 20;
            } else {
                percentPerMessage = 10;
            }


            const percentMessages = nMessages * percentPerMessage;

            const messageMin = 20;
            const messageMax = (nOptions > 2) ? 50 : 70;

            const adjustedPercentMessage = (nOptions > 0) ? constrain(messageMin, messageMax, percentMessages) : 100;
            const adjustedPercentOption = 100 - adjustedPercentMessage;

            messageContainer.style.flex = adjustedPercentMessage;
            optionContainer.style.flex = adjustedPercentOption;

            if (nOptions > 0) {
                setTimeout(optionManager.adjust, 100);
            }
        }

        realAdjustFlex();
        setTimeout(realAdjustFlex, 1000);
    }

    function sendMessage(content) {
        const message = new Message(content, messageIDused++, true);

        messageContainer.appendChild(message.HTML);
        adjustFlex();
    }

    // animate message to page
    function receiveMessage(messageID, onFinish) {
        sendingActive = true;
        const message = getMessageByID(messageID);
        if (message) {
            let typing = true;
            const waitTime = message.content.replace(/<(?:.|\n)*?>/gm, '').length * typingSpeed + anime.random(900, 1200);
            removeElement(messageID, pendingMessageIDs);
            currentMessageID = messageID;

            // append to container
            messageContainer.appendChild(message.HTML);

            const dimensions = getDimensions(message);
            message.contentWrapper.style.width = dimensions.loading.w;
            message.contentWrapper.style.height = dimensions.loading.h;
            const displayBefore = message.textHTML.style.display;
            message.textHTML.style.display = "none";

            // scroll into view
            anime({
                targets: messageContainer,
                scrollTop: messageContainer.scrollHeight,
                duration: 1000,
                easing: 'linear'
            });

            // show up
            anime({
                targets: message.HTML,
                opacity: [0, 1]
            });

            // loading dots
            anime({
                targets: message.HTML.querySelectorAll('b'),
                opacity: [0.5, 1, 0.5],
                duration: 600,
                delay: anime.stagger(200),
                easing: 'linear',
                complete: (anim) => {
                    if (typing) {
                        anim.restart();
                    }
                }
            });

            // time's up, show content
            setTimeout(() => {
                typing = false;

                // hide dots
                anime({
                    targets: message.HTML.querySelectorAll('b'),
                    opacity: 0,
                    scale: 0,
                    loop: false,
                    duration: 200,
                    easing: 'easeOutQuad',
                });

                // adjust bubble size
                anime({
                    targets: message.contentWrapper,
                    width: [dimensions.loading.w, dimensions.message.w],
                    height: [dimensions.loading.h, dimensions.message.h],
                    easing: 'easeOutQuad',
                    duration: 200,
                    complete: () => {
                        sendingActive = false;
                        message.textHTML.style.opacity = 0;
                        message.textHTML.style.display = displayBefore;
                        // show text
                        anime({
                            targets: message.textHTML,
                            opacity: 1,
                            easing: 'easeInQuad',
                            duration: 200,
                        });

                        // append options if any
                        if (message.optionIDs) {
                            for (let optionID of message.optionIDs) {
                                const option = getOptionByID(optionID);
                                removeElement(optionID, pendingOptionIDs);
                                displayingOptionIDs.push(optionID);
                                optionManager.add(option.content);
                                adjustFlex();
                            }
                        }

                        // call callback if any
                        if (onFinish) {
                            onFinish();
                        }
                    }
                })
            }, waitTime);

            sentMessageIDs.push(messageID);
            currentMessageID = undefined;
            adjustFlex();
        }
    }

    // send next message to page
    function receiveNextMessage() {
        // send by increasing id
        if (pendingMessageIDs.length > 0) {
            receiveMessage(pendingMessageIDs[0], receiveNextMessage);
        }
    }

    // remove element from array
    // ref https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript
    function removeElement(element, array) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    // get object by ID in list if any
    function getByID(id, list) {
        for (let object of list) {
            if (object.id === id) {
                return object;
            }
        }
    }

    function getMessageByID(id) {
        return getByID(id, messages);
    }

    function getOptionByID(id) {
        return getByID(id, options);
    }

    function getDimensions(message) {
        return {
            message: {
                w: anime.get(message.textHTML, "width", "rem") + 'rem',
                h: anime.get(message.textHTML, "height", "rem") + 'rem',
            },
            loading: {
                w: anime.get(message.loadingHTML, "width", "rem") + 'rem',
                h: anime.get(message.loadingHTML, "height", "rem") + 'rem',
            }
        }
    }

    function start() {
        receiveNextMessage();
    }

    return {
        init,
        parseJSON,
        start
    }
};

// ref https://stackoverflow.com/a/18278346/9494810
function loadJSON(path, success, error) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

/*
* start interactive message
*
* filePath: json file path
* if no such file, error will be logged and nothing will start
* */
function interactiveMessageStart(filePath) {
    loadJSON(filePath,
        data => {
            const manager = new MessageManager();
            manager.init();
            manager.parseJSON(data);
            manager.start();
        },
        () => console.log("Interactive Message", "error loading JSON")
    )
}