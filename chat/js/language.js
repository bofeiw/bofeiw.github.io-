// 作者：绿箩
// 来源：CSDN
// 原文：https://blog.csdn.net/qq_26212731/article/details/78457198
// 版权声明：本文为博主原创文章，转载请附上博文链接
// 已修改

const replaceToZH = function () {
    const nameHeader = document.getElementById("name-header");
    nameHeader.innerText = "王博飞"
};

const type = navigator.appName;
let lang;
if (type === "Netscape") {
    lang = navigator.language;//获取浏览器配置语言，支持非IE浏览器
} else {
    lang = navigator.userLanguage;//获取浏览器配置语言，支持IE5+ == navigator.systemLanguage
}

lang = lang.substr(0, 2);//获取浏览器配置语言前两位
if (lang === "zh") {
    replaceToZH();
} else if (lang === "en") {
    // english, do nothing
} else {
    // other language
}