var AH_digexID = "";

$(document).ready(function () {
    var digexHead = $("#digexQScript");
    // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23                        
    var svcUrl = digexHead.attr("data-server");
    var browserInfo = '',
        isMobile = {
            Android: function () {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function () {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function () {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        },
        LogBrowserData = function () {
            browserInfo = GetBrowserDataString();
            SubmitToService();
        },
        SubmitToService = function () {
            var logUrl = svcUrl + '/DigEx/Queue';
            
            $.post(logUrl, "jsonBody=" + browserInfo, function (data) {
                if (LogPath !== undefined) {
                    LogPath(data);
                }
                if (typeof dataLayer !== "undefined") {
                    dataLayer.push({
                        'DigExID': data,
                         'event': 'setDigExID'
                    });
                }
            });
        },
        GetPlatform = function () {
            return navigator.platform.toUpperCase();
        },
        GetWebDriverKit = function () {
            if (navigator.webdriver) {
                return "1";
            }
            else {
                return "0";
            }
        },
        GetHardwardConcurrency = function () {
            return navigator.hardwareConcurrency;
        },
        GetTimeZoneOffset = function () {
            return new Date().getTimezoneOffset();
        },
        GetTimeZone = function () {
            if (window.Intl && window.Intl.DateTimeFormat) {
                return new window.Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
            return 'na';
        },
        GetTouchSupport = function () {
            var maxTouchPoints = 0
            if (typeof navigator.maxTouchPoints !== 'undefined') {
                maxTouchPoints = navigator.maxTouchPoints
            } else if (typeof navigator.msMaxTouchPoints !== 'undefined') {
                maxTouchPoints = navigator.msMaxTouchPoints
            }
            return "TS" + maxTouchPoints;
        },
        GetBrowserDataString = function () {
            var info = '{';
            var browserData = BrowserInfo().split('/');
            var nav = window.navigator;
            var screen = window.screen;
            var numberPattern = /\d+/g;

            var ipAddress = '1.1.1.1';

            info += '"BrowserName": "' + browserData[0] + '", ';
            info += '"BrowserVersion":"' + browserData[1] + '", ';
            info += '"BrowserLanguage":"' + GetLanguage() + '", ';
            info += '"OperatingSystem":"' + OSDetails() + '", ';
            info += '"NumericAgent":"' + nav.userAgent.match(numberPattern).join('') + '", ';
            var screenWidth = '';
            var screenHeight = '';
            if (screen.width) {
                screenWidth = (screen.width) ? screen.width : '';
                screenHeight = (screen.height) ? screen.height : '';
            }
            info += '"ScreenWidth":"' + screenWidth + '", ';
            info += '"ScreenHeight":"' + screenHeight + '", ';
            info += '"ScreenPixelDepth":"' + screen.pixelDepth + '", ';
            info += '"IPAddress":"' + ipAddress + '", ';
            info += '"CookiesEnabled":"' + AreCookiesEnabled() + '", ';
            info += '"MobileDevice":"' + IsMobileSite() + '", ';
            info += '"HardwareConcurrency":"' + GetHardwardConcurrency() + '", ';
            info += '"WebDriverKit":"' + GetWebDriverKit() + '", ';
            info += '"Platform":"' + GetPlatform() + '", ';
            info += '"Source":"' + getParameterByName('utm_source') + '", ';
            info += '"Campaign":"' + getParameterByName('utm_campaign') + '", ';
            info += '"SubID":"' + getParameterByName('subid') + '", ';
            info += '"Note":"' + getParameterByName('utm_medium') + '", ';
            info += '"Status":"' + getParameterByName('status') + '", ';
            info += '"Content":"' + getParameterByName('utm_content') + '", ';
            //info += '"Referrer":"' + document.referrer + '", ';
            info += '"TimeZoneOffset":"' + GetTimeZoneOffset() + '", ';
            info += '"TimeZone":"' + GetTimeZone() + '", ';
            info += '"TouchSupport":"' + GetTouchSupport() + '", ';

            info = info.replace(/,+$/, "") + "}";
            info = info.replace('\\', '');
            return info;
        },
        BrowserInfo = function () {
            var ua = navigator.userAgent,
                appname = navigator.appName,
                temp;
            var browser = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (browser && (temp = ua.match(/version\/([\.\d]+)/i)) != null) browser[2] = temp[1];
            if (browser == null) {
                //this will be IE version greater than 10.0
                var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
                if (isIE11) {
                    browser = [];
                    browser[0] = "MSIE 11.0";
                    browser[1] = "MSIE";
                    browser[2] = "11.0";
                }
            }
            browser = browser ? [browser[1], browser[2]] : [appname, navigator.appVersion, '-?'];
            return browser[0] + '/' + browser[1];
        },
        OSDetails = function () {
            var uagent = navigator.userAgent;
            var OSArray = [
                { s: 'Windows 3.11', r: /Win16/ },
                { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
                { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
                { s: 'Windows 98', r: /(Windows 98|Win98)/ },
                { s: 'Windows CE', r: /Windows CE/ },
                { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
                { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
                { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
                { s: 'Windows Vista', r: /Windows NT 6.0/ },
                { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
                { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
                { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
                { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
                { s: 'Windows ME', r: /Windows ME/ },
                { s: 'Android', r: /Android/ },
                { s: 'BlackBerry', r: /BlackBerry/ },
                { s: 'Open BSD', r: /OpenBSD/ },
                { s: 'Sun OS', r: /SunOS/ },
                { s: 'Linux', r: /(Linux|X11)/ },
                { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
                { s: 'Mac OS X', r: /Mac OS X/ },
                { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
                { s: 'QNX', r: /QNX/ },
                { s: 'UNIX', r: /UNIX/ },
                { s: 'BeOS', r: /BeOS/ },
                { s: 'OS/2', r: /OS\/2/ },
                { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
            ];

            var osname = '';
            var osversion = '';
            for (var o in OSArray) {
                var os = OSArray[o];
                if (os.r.test(uagent)) {
                    osname = os.s;
                    break;
                }
            }
            return osname + ' ' + osversion;
        },
        AreCookiesEnabled = function () {
            var cookieEnabled = (navigator.cookieEnabled) ? true : false;

            if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
                document.cookie = 'browsertestcookie';
                cookieEnabled = (document.cookie.indexOf('browsertestcookie') != -1) ? true : false;
            }

            return cookieEnabled;
        },
        IsMobileSite = function () {
            var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion);
            if (typeof mobile == 'undefined')
                return false;
            else
                return mobile;
        },
        GetLanguage = function () {
            var browserlanguage = navigator.browserLanguage;
            if (typeof browserlanguage == 'undefined') {
                browserlanguage = navigator.language;
            }
            browserlanguage = browserlanguage.toLowerCase();
            return browserlanguage;
        },
        InitializeLogBrowserData = function () {
            LogBrowserData();
        };

    InitializeLogBrowserData();

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return '';
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }


});
