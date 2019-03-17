/* bubble messages */
/* origin: https://github.com/juliangarnier/juliangarnier.com */
/* Author: https://github.com/juliangarnier */

/*
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Copyright (c) 2016 Julian Garnier
 */

// check if element is completely inside viewport
// return the relative state of the element compared to viewport
// https://codepen.io/bfintal/pen/Ejvgrp, modified
const elementViewState = el => {
    const scroll = window.scrollY || window.pageYOffset
    const boundsTop = el.getBoundingClientRect().top + scroll

    const viewport = {
        top: scroll,
        bottom: scroll + window.innerHeight,
    }

    const bounds = {
        top: boundsTop,
        bottom: boundsTop + el.clientHeight,
    }

    if (bounds.top > viewport.top && bounds.bottom < viewport.bottom) {
        return "inside";
    } else if (bounds.top <= viewport.top) {
        return "up";
    } else {
        return "down"
    }
}

// scroll to element completely inside viewport
function scrollToElement(element) {
    const elementState = elementViewState(element);
    if (elementState === "up") {
        var scroll = new SmoothScroll();
        scroll.animateScroll(element);
    } else if (elementState === "down") {
        element.scrollIntoView(false);
        // element.scrollIntoView({alignToTop: false, behavior: 'smooth', block: 'start', inline: "nearest" });
    }
}

let talk = function () {
    // speed for english characters
    let typingSpeed = 20;

    var elementUniqueID = 0;
    var messagesEl = document.querySelector('.messages');
    var loadingText = '<b>•</b><b>•</b><b>•</b>';
    var messageIndex = 0;

    var getCurrentTime = function () {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var current = hours + (minutes * .01);
        if (current >= 5 && current < 13) {
            switch (lang) {
                case "zh":
                    return '祝你今天愉快！';
                default:
                    return 'Have a nice day!';
            }
        } else if (current >= 13 && current < 21) {
            switch (lang) {
                case "zh":
                    return '祝你下午开心！';
                default:
                    return 'Have a nice evening!';
            }
        } else if (current >= 21 || current < 5) {
            switch (lang) {
                case "zh":
                    return '晚安！';
                default:
                    return 'Have a good night!';
            }
        }
    }

    let messages = [
        'Hi there 👋',
        'I\'m a CS student at <a href="https://en.wikipedia.org/wiki/University_of_New_South_Wales">UNSW Sydney</a>',
        'My first year of uni was at <a href="https://en.wikipedia.org/wiki/University_of_Melbourne">Melbourne University</a>',
        'But I like UNSW Sydney more, so transferred',
        'I love <a href="https://github.com/bofey">coding</a>, and am implementing <a href="https://github.com/bofey/Algorithms-in-C">algorithms</a> in C',
        'I appreciate design of good UI and good UX',
        'Code of this site is available at <a href="https://github.com/bofey/bofey.github.io">GitHub repo</a>',
        'I\'m also a casual tutor of computer science courses',
        'I\'m actively looking for a software related job',
        'You can <a href="mailto:boey.me@gmail.com">email</a> me, or send me a <a href="sms:0451793688">message</a>',
        'or directly <a href="tel:0451793688">call</a> me',
        getCurrentTime(),
        ' 👀 B.W'
    ];

    if (lang === "zh") {
        messages = [
            '哈喽 👋',
            '我是<a href="https://zh.wikipedia.org/zh-cn/新南威尔士大学">新南威尔士大学</a>计算机科学的学生',
            '我在<a href="https://zh.wikipedia.org/wiki/墨尔本大学">墨尔本大学</a>读了大一',
            '因为更喜欢新南威尔士大学，所以转了过来',
            '我爱<a href="https://github.com/bofey">编程</a>，现在正在用C写<a href="https://github.com/bofey/Algorithms-in-C">算法</a>',
            '我很欣赏经过细心设计的UI和UX',
            '这个网站的代码可以在这个<a href="https://github.com/bofey/bofey.github.io">GitHub仓库</a>里看到',
            '我还是一个计算机课程的私教',
            '我正在积极地找一份软件相关的工作',
            '你可以给我<a href="mailto:boey.me@gmail.com">发邮件</a>，给我<a href="sms:0451793688">发短信</a>',
            '或者直接给我<a href="tel:0451793688">打电话</a>',
            getCurrentTime(),
            ' 👀 飞'
        ];
        typingSpeed = 80;
    }

    var getFontSize = function () {
        return parseInt(getComputedStyle(document.body).getPropertyValue('font-size'));
    }

    var pxToRem = function (px) {
        return px / getFontSize() + 'rem';
    }

    var createBubbleElements = function (message, position) {
        const elementIDString = "message-ID-" + elementUniqueID;
        var bubbleEl = document.createElement('div');
        var messageEl = document.createElement('span');
        var loadingEl = document.createElement('span');
        bubbleEl.id = elementIDString;
        bubbleEl.classList.add('bubble');
        bubbleEl.classList.add('is-loading');
        bubbleEl.classList.add('cornered');
        bubbleEl.classList.add(position === 'right' ? 'right' : 'left');
        messageEl.classList.add('message');
        loadingEl.classList.add('loading');
        messageEl.innerHTML = message;
        loadingEl.innerHTML = loadingText;
        bubbleEl.appendChild(loadingEl);
        bubbleEl.appendChild(messageEl);
        bubbleEl.style.opacity = 0;
        ++elementUniqueID;
        return {
            bubble: bubbleEl,
            message: messageEl,
            loading: loadingEl
        }
    }

    var getDimentions = function (elements) {
        return dimensions = {
            loading: {
                w: '4rem',
                h: '2.25rem'
            },
            bubble: {
                w: pxToRem(elements.bubble.offsetWidth + 4),
                h: pxToRem(elements.bubble.offsetHeight)
            },
            message: {
                w: pxToRem(elements.message.offsetWidth + 4),
                h: pxToRem(elements.message.offsetHeight)
            }
        }
    }

    var sendMessage = function (message, position) {
        var loadingDuration = (message.replace(/<(?:.|\n)*?>/gm, '').length * typingSpeed) + anime.random(300, 800);
        var elements = createBubbleElements(message, position);
        messagesEl.appendChild(elements.bubble);
        messagesEl.appendChild(document.createElement('br'));
        var dimensions = getDimentions(elements);
        elements.bubble.style.width = '0rem';
        elements.bubble.style.height = dimensions.loading.h;
        elements.message.style.width = dimensions.message.w;
        elements.message.style.height = dimensions.message.h;
        elements.bubble.style.opacity = 1;
        scrollToElement(elements.bubble);
        var bubbleOffset = elements.bubble.offsetTop + elements.bubble.offsetHeight;
        if (bubbleOffset > messagesEl.offsetHeight) {
            var scrollMessages = anime({
                targets: messagesEl,
                scrollTop: bubbleOffset,
                duration: 750
            });
        }
        var bubbleSize = anime({
            targets: elements.bubble,
            width: ['0rem', dimensions.loading.w],
            marginTop: ['2.5rem', 0],
            marginLeft: ['-2.5rem', 0],
            duration: 800,
            easing: 'easeOutElastic'
        });
        var loadingLoop = anime({
            targets: elements.bubble,
            scale: [1.05, .95],
            duration: 1100,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutQuad'
        });
        var dotsStart = anime({
            targets: elements.loading,
            translateX: ['-2rem', '0rem'],
            scale: [.5, 1],
            duration: 400,
            delay: 25,
            easing: 'easeOutElastic',
        });
        var dotsPulse = anime({
            targets: elements.bubble.querySelectorAll('b'),
            scale: [1, 1.25],
            opacity: [.5, 1],
            duration: 300,
            loop: true,
            direction: 'alternate',
            delay: function (i) {
                return (i * 100) + 50
            }
        });
        setTimeout(function () {
            loadingLoop.pause();
            dotsPulse.restart({
                opacity: 0,
                scale: 0,
                loop: false,
                direction: 'forwards',
                update: function (a) {
                    if (a.progress >= 65 && elements.bubble.classList.contains('is-loading')) {
                        elements.bubble.classList.remove('is-loading');
                        anime({
                            targets: elements.message,
                            opacity: [0, 1],
                            duration: 300,
                        });
                    }
                }
            });
            bubbleSize.restart({
                scale: 1,
                width: [dimensions.loading.w, dimensions.bubble.w],
                height: [dimensions.loading.h, dimensions.bubble.h],
                marginTop: 0,
                marginLeft: 0,
                begin: function () {
                    if (messageIndex < messages.length) elements.bubble.classList.remove('cornered');
                }
            })
        }, loadingDuration - 50);
    }

    var sendMessages = function () {
        var message = messages[messageIndex];
        if (!message) return;
        sendMessage(message);
        ++messageIndex;
        setTimeout(sendMessages, (message.replace(/<(?:.|\n)*?>/gm, '').length * typingSpeed) + anime.random(900, 1500));
    }

    sendMessages();

};

window.onload = function () {
    setTimeout(talk, 2100);
};