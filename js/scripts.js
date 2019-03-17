/* bubble messages */
/* origin: https://github.com/juliangarnier/juliangarnier.com */
/* Author: https://github.com/juliangarnier */

/*
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Copyright (c) 2016 Julian Garnier
 */

let talk = function () {
    var messagesEl = document.querySelector('.messages');
    var typingSpeed = 20;
    var loadingText = '<b>•</b><b>•</b><b>•</b>';
    var messageIndex = 0;

    var getCurrentTime = function () {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var current = hours + (minutes * .01);
        if (current >= 5 && current < 19) {
            switch (lang) {
                case "zh":
                    return '祝你今天愉快！';
                default:
                    return 'Have a nice day!';
            }
        } else if (current >= 19 && current < 22) {
            switch (lang) {
                case "zh":
                    return '祝你下午开心！';
                default:
                    return 'Have a nice evening!';
            }
        } else if (current >= 22 || current < 5) {
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
        'I love <a href="https://github.com/bofey">coding</a>, and am implementing <a href="https://github.com/bofey/Algorithms-in-C">algorithms</a> in C',
        'I appreciate design of good UI and good UX',
        'Code of this site is available at <a href="https://github.com/bofey/bofey.github.io">GitHub repo</a>',
        'I am a casual tutor of computer science courses',
        'I\'m actively looking for a software related job',
        'You can <a href="mailto:boey.me@gmail.com">email</a> me, or send me a <a href="sms:0451793688">message</a>, or directly <a href="tel:0451793688">call</a> me',
        getCurrentTime() + ' 👀 B.W'
    ];

    if (lang === "zh") {
        messages = [
            '哈喽 👋',
            '我是<a href="https://zh.wikipedia.org/zh-cn/新南威尔士大学">新南威尔士大学计算机科学的学生</a>',
            '我爱<a href="https://github.com/bofey">编程</a>，现在正在用C写<a href="https://github.com/bofey/Algorithms-in-C">算法</a>',
            '我很欣赏经过细心设计的UI和UX',
            '这个网站的代码可以在<a href="https://github.com/bofey/bofey.github.io">GitHub仓库</a>里找到',
            '我还是一个计算机课程的私教',
            '我正在积极地找一份软件相关地工作',
            '你可以给我发<a href="mailto:boey.me@gmail.com">邮件</a>，给我发<a href="sms:0451793688">信息</a>，或者直接给我打<a href="tel:0451793688">电话</a>',
            getCurrentTime() + ' 👀 飞'
        ];
    }

    var getFontSize = function () {
        return parseInt(getComputedStyle(document.body).getPropertyValue('font-size'));
    }

    var pxToRem = function (px) {
        return px / getFontSize() + 'rem';
    }

    var createBubbleElements = function (message, position) {
        var bubbleEl = document.createElement('div');
        var messageEl = document.createElement('span');
        var loadingEl = document.createElement('span');
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
        var loadingDuration = (message.replace(/<(?:.|\n)*?>/gm, '').length * typingSpeed) + 500;
        var elements = createBubbleElements(message, position);
        messagesEl.appendChild(elements.bubble);
        messagesEl.appendChild(document.createElement('br'));
        var dimensions = getDimentions(elements);
        elements.bubble.style.width = '0rem';
        elements.bubble.style.height = dimensions.loading.h;
        elements.message.style.width = dimensions.message.w;
        elements.message.style.height = dimensions.message.h;
        elements.bubble.style.opacity = 1;
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
        setTimeout(sendMessages, (message.replace(/<(?:.|\n)*?>/gm, '').length * typingSpeed) + anime.random(900, 1200));
    }

    sendMessages();

};

window.onload = function () {
    setTimeout(talk, 2100);
};