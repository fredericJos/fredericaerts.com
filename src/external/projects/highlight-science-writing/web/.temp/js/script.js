/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

'use strict';

window.matchMedia || (window.matchMedia = (function () {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style = document.createElement('style'),
            script = document.getElementsByTagName('script')[0],
            info = null;

        style.type = 'text/css';
        style.id = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function matchMedium(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function (media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
})());
/*! Picturefill - Responsive Images that work today.
*  Author: Scott Jehl, Filament Group, 2012 ( new proposal implemented by Shawn Jansepar )
*  License: MIT/GPLv2
*  Spec: http://picture.responsiveimages.org/
*/
(function (w, doc, image) {
    // Enable strict mode
    "use strict";

    function expose(picturefill) {
        /* expose picturefill */
        if (typeof module === "object" && typeof module.exports === "object") {
            // CommonJS, just export
            module.exports = picturefill;
        } else if (typeof define === "function" && define.amd) {
            // AMD support
            define("picturefill", function () {
                return picturefill;
            });
        }
        if (typeof w === "object") {
            // If no AMD and we are in the browser, attach to window
            w.picturefill = picturefill;
        }
    }

    // If picture is supported, well, that's awesome. Let's get outta here...
    if (w.HTMLPictureElement) {
        expose(function () {});
        return;
    }

    // HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
    doc.createElement("picture");

    // local object for method references and testing exposure
    var pf = w.picturefill || {};

    var regWDesc = /\s+\+?\d+(e\d+)?w/;

    // namespace
    pf.ns = "picturefill";

    // srcset support test
    (function () {
        pf.srcsetSupported = "srcset" in image;
        pf.sizesSupported = "sizes" in image;
        pf.curSrcSupported = "currentSrc" in image;
    })();

    // just a string trim workaround
    pf.trim = function (str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    };

    /**
     * Gets a string and returns the absolute URL
     * @param src
     * @returns {String} absolute URL
     */
    pf.makeUrl = (function () {
        var anchor = doc.createElement("a");
        return function (src) {
            anchor.href = src;
            return anchor.href;
        };
    })();

    /**
     * Shortcut method for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
     */
    pf.restrictsMixedContent = function () {
        return w.location.protocol === "https:";
    };
    /**
     * Shortcut method for matchMedia ( for easy overriding in tests )
     */

    pf.matchesMedia = function (media) {
        return w.matchMedia && w.matchMedia(media).matches;
    };

    // Shortcut method for `devicePixelRatio` ( for easy overriding in tests )
    pf.getDpr = function () {
        return w.devicePixelRatio || 1;
    };

    /**
     * Get width in css pixel value from a "length" value
     * http://dev.w3.org/csswg/css-values-3/#length-value
     */
    pf.getWidthFromLength = function (length) {
        var cssValue;
        // If a length is specified and doesn’t contain a percentage, and it is greater than 0 or using `calc`, use it. Else, abort.
        if (!(length && length.indexOf("%") > -1 === false && (parseFloat(length) > 0 || length.indexOf("calc(") > -1))) {
            return false;
        }

        /**
         * If length is specified in  `vw` units, use `%` instead since the div we’re measuring
         * is injected at the top of the document.
         *
         * TODO: maybe we should put this behind a feature test for `vw`? The risk of doing this is possible browser inconsistancies with vw vs %
         */
        length = length.replace("vw", "%");

        // Create a cached element for getting length value widths
        if (!pf.lengthEl) {
            pf.lengthEl = doc.createElement("div");

            // Positioning styles help prevent padding/margin/width on `html` or `body` from throwing calculations off.
            pf.lengthEl.style.cssText = "border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden";

            // Add a class, so that everyone knows where this element comes from
            pf.lengthEl.className = "helper-from-picturefill-js";
        }

        pf.lengthEl.style.width = "0px";

        try {
            pf.lengthEl.style.width = length;
        } catch (e) {}

        doc.body.appendChild(pf.lengthEl);

        cssValue = pf.lengthEl.offsetWidth;

        if (cssValue <= 0) {
            cssValue = false;
        }

        doc.body.removeChild(pf.lengthEl);

        return cssValue;
    };

    pf.detectTypeSupport = function (type, typeUri) {
        // based on Modernizr's lossless img-webp test
        // note: asynchronous
        var image = new w.Image();
        image.onerror = function () {
            pf.types[type] = false;
            picturefill();
        };
        image.onload = function () {
            pf.types[type] = image.width === 1;
            picturefill();
        };
        image.src = typeUri;

        return "pending";
    };
    // container of supported mime types that one might need to qualify before using
    pf.types = pf.types || {};

    pf.initTypeDetects = function () {
        // Add support for standard mime types
        pf.types["image/jpeg"] = true;
        pf.types["image/gif"] = true;
        pf.types["image/png"] = true;
        pf.types["image/svg+xml"] = doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        pf.types["image/webp"] = pf.detectTypeSupport("image/webp", "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");
    };

    pf.verifyTypeSupport = function (source) {
        var type = source.getAttribute("type");
        // if type attribute exists, return test result, otherwise return true
        if (type === null || type === "") {
            return true;
        } else {
            var pfType = pf.types[type];
            // if the type test is a function, run it and return "pending" status. The function will rerun picturefill on pending elements once finished.
            if (typeof pfType === "string" && pfType !== "pending") {
                pf.types[type] = pf.detectTypeSupport(type, pfType);
                return "pending";
            } else if (typeof pfType === "function") {
                pfType();
                return "pending";
            } else {
                return pfType;
            }
        }
    };

    // Parses an individual `size` and returns the length, and optional media query
    pf.parseSize = function (sourceSizeStr) {
        var match = /(\([^)]+\))?\s*(.+)/g.exec(sourceSizeStr);
        return {
            media: match && match[1],
            length: match && match[2]
        };
    };

    // Takes a string of sizes and returns the width in pixels as a number
    pf.findWidthFromSourceSize = function (sourceSizeListStr) {
        // Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
        //                            or (min-width:30em) calc(30% - 15px)
        var sourceSizeList = pf.trim(sourceSizeListStr).split(/\s*,\s*/),
            winningLength;

        for (var i = 0, len = sourceSizeList.length; i < len; i++) {
            // Match <media-condition>? length, ie ( min-width: 50em ) 100%
            var sourceSize = sourceSizeList[i],

            // Split "( min-width: 50em ) 100%" into separate strings
            parsedSize = pf.parseSize(sourceSize),
                length = parsedSize.length,
                media = parsedSize.media;

            if (!length) {
                continue;
            }
            // if there is no media query or it matches, choose this as our winning length
            if ((!media || pf.matchesMedia(media)) && (
            // pass the length to a method that can properly determine length
            // in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
            winningLength = pf.getWidthFromLength(length))) {
                break;
            }
        }

        //if we have no winningLength fallback to 100vw
        return winningLength || Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
    };

    pf.parseSrcset = function (srcset) {
        /**
         * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
         * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
         *
         * 1. Let input (`srcset`) be the value passed to this algorithm.
         * 2. Let position be a pointer into input, initially pointing at the start of the string.
         * 3. Let raw candidates be an initially empty ordered list of URLs with associated
         *    unparsed descriptors. The order of entries in the list is the order in which entries
         *    are added to the list.
         */
        var candidates = [];

        while (srcset !== "") {
            srcset = srcset.replace(/^\s+/g, "");

            // 5. Collect a sequence of characters that are not space characters, and let that be url.
            var pos = srcset.search(/\s/g),
                url,
                descriptor = null;

            if (pos !== -1) {
                url = srcset.slice(0, pos);

                var last = url.slice(-1);

                // 6. If url ends with a U+002C COMMA character (,), remove that character from url
                // and let descriptors be the empty string. Otherwise, follow these substeps
                // 6.1. If url is empty, then jump to the step labeled descriptor parser.

                if (last === "," || url === "") {
                    url = url.replace(/,+$/, "");
                    descriptor = "";
                }
                srcset = srcset.slice(pos + 1);

                // 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
                // let that be descriptors.
                if (descriptor === null) {
                    var descpos = srcset.indexOf(",");
                    if (descpos !== -1) {
                        descriptor = srcset.slice(0, descpos);
                        srcset = srcset.slice(descpos + 1);
                    } else {
                        descriptor = srcset;
                        srcset = "";
                    }
                }
            } else {
                url = srcset;
                srcset = "";
            }

            // 7. Add url to raw candidates, associated with descriptors.
            if (url || descriptor) {
                candidates.push({
                    url: url,
                    descriptor: descriptor
                });
            }
        }
        return candidates;
    };

    pf.parseDescriptor = function (descriptor, sizesattr) {
        // 11. Descriptor parser: Let candidates be an initially empty source set. The order of entries in the list
        // is the order in which entries are added to the list.
        var sizes = sizesattr || "100vw",
            sizeDescriptor = descriptor && descriptor.replace(/(^\s+|\s+$)/g, ""),
            widthInCssPixels = pf.findWidthFromSourceSize(sizes),
            resCandidate;

        if (sizeDescriptor) {
            var splitDescriptor = sizeDescriptor.split(" ");

            for (var i = splitDescriptor.length - 1; i >= 0; i--) {
                var curr = splitDescriptor[i],
                    lastchar = curr && curr.slice(curr.length - 1);

                if ((lastchar === "h" || lastchar === "w") && !pf.sizesSupported) {
                    resCandidate = parseFloat(parseInt(curr, 10) / widthInCssPixels);
                } else if (lastchar === "x") {
                    var res = curr && parseFloat(curr, 10);
                    resCandidate = res && !isNaN(res) ? res : 1;
                }
            }
        }
        return resCandidate || 1;
    };

    /**
     * Takes a srcset in the form of url/
     * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
     *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
     *     "images/pic-small.png"
     * Get an array of image candidates in the form of
     *      {url: "/foo/bar.png", resolution: 1}
     * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
     * If sizes is specified, resolution is calculated
     */
    pf.getCandidatesFromSourceSet = function (srcset, sizes) {
        var candidates = pf.parseSrcset(srcset),
            formattedCandidates = [];

        for (var i = 0, len = candidates.length; i < len; i++) {
            var candidate = candidates[i];

            formattedCandidates.push({
                url: candidate.url,
                resolution: pf.parseDescriptor(candidate.descriptor, sizes)
            });
        }
        return formattedCandidates;
    };

    /**
     * if it's an img element and it has a srcset property,
     * we need to remove the attribute so we can manipulate src
     * (the property's existence infers native srcset support, and a srcset-supporting browser will prioritize srcset's value over our winning picture candidate)
     * this moves srcset's value to memory for later use and removes the attr
     */
    pf.dodgeSrcset = function (img) {
        if (img.srcset) {
            img[pf.ns].srcset = img.srcset;
            img.srcset = "";
            img.setAttribute("data-pfsrcset", img[pf.ns].srcset);
        }
    };

    // Accept a source or img element and process its srcset and sizes attrs
    pf.processSourceSet = function (el) {
        var srcset = el.getAttribute("srcset"),
            sizes = el.getAttribute("sizes"),
            candidates = [];

        // if it's an img element, use the cached srcset property (defined or not)
        if (el.nodeName.toUpperCase() === "IMG" && el[pf.ns] && el[pf.ns].srcset) {
            srcset = el[pf.ns].srcset;
        }

        if (srcset) {
            candidates = pf.getCandidatesFromSourceSet(srcset, sizes);
        }
        return candidates;
    };

    pf.backfaceVisibilityFix = function (picImg) {
        // See: https://github.com/scottjehl/picturefill/issues/332
        var style = picImg.style || {},
            WebkitBackfaceVisibility = ("webkitBackfaceVisibility" in style),
            currentZoom = style.zoom;

        if (WebkitBackfaceVisibility) {
            style.zoom = ".999";

            WebkitBackfaceVisibility = picImg.offsetWidth;

            style.zoom = currentZoom;
        }
    };

    pf.setIntrinsicSize = (function () {
        var urlCache = {};
        var setSize = function setSize(picImg, width, res) {
            if (width) {
                picImg.setAttribute("width", parseInt(width / res, 10));
            }
        };
        return function (picImg, bestCandidate) {
            var img;
            if (!picImg[pf.ns] || w.pfStopIntrinsicSize) {
                return;
            }
            if (picImg[pf.ns].dims === undefined) {
                picImg[pf.ns].dims = picImg.getAttribute("width") || picImg.getAttribute("height");
            }
            if (picImg[pf.ns].dims) {
                return;
            }

            if (bestCandidate.url in urlCache) {
                setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution);
            } else {
                img = doc.createElement("img");
                img.onload = function () {
                    urlCache[bestCandidate.url] = img.width;

                    //IE 10/11 don't calculate width for svg outside document
                    if (!urlCache[bestCandidate.url]) {
                        try {
                            doc.body.appendChild(img);
                            urlCache[bestCandidate.url] = img.width || img.offsetWidth;
                            doc.body.removeChild(img);
                        } catch (e) {}
                    }

                    if (picImg.src === bestCandidate.url) {
                        setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution);
                    }
                    picImg = null;
                    img.onload = null;
                    img = null;
                };
                img.src = bestCandidate.url;
            }
        };
    })();

    pf.applyBestCandidate = function (candidates, picImg) {
        var candidate, length, bestCandidate;

        candidates.sort(pf.ascendingSort);

        length = candidates.length;
        bestCandidate = candidates[length - 1];

        for (var i = 0; i < length; i++) {
            candidate = candidates[i];
            if (candidate.resolution >= pf.getDpr()) {
                bestCandidate = candidate;
                break;
            }
        }

        if (bestCandidate) {

            bestCandidate.url = pf.makeUrl(bestCandidate.url);

            if (picImg.src !== bestCandidate.url) {
                if (pf.restrictsMixedContent() && bestCandidate.url.substr(0, "http:".length).toLowerCase() === "http:") {
                    if (window.console !== undefined) {
                        console.warn("Blocked mixed content image " + bestCandidate.url);
                    }
                } else {
                    picImg.src = bestCandidate.url;
                    // currentSrc attribute and property to match
                    // http://picture.responsiveimages.org/#the-img-element
                    if (!pf.curSrcSupported) {
                        picImg.currentSrc = picImg.src;
                    }

                    pf.backfaceVisibilityFix(picImg);
                }
            }

            pf.setIntrinsicSize(picImg, bestCandidate);
        }
    };

    pf.ascendingSort = function (a, b) {
        return a.resolution - b.resolution;
    };

    /**
     * In IE9, <source> elements get removed if they aren't children of
     * video elements. Thus, we conditionally wrap source elements
     * using <!--[if IE 9]><video style="display: none;"><![endif]-->
     * and must account for that here by moving those source elements
     * back into the picture element.
     */
    pf.removeVideoShim = function (picture) {
        var videos = picture.getElementsByTagName("video");
        if (videos.length) {
            var video = videos[0],
                vsources = video.getElementsByTagName("source");
            while (vsources.length) {
                picture.insertBefore(vsources[0], video);
            }
            // Remove the video element once we're finished removing its children
            video.parentNode.removeChild(video);
        }
    };

    /**
     * Find all `img` elements, and add them to the candidate list if they have
     * a `picture` parent, a `sizes` attribute in basic `srcset` supporting browsers,
     * a `srcset` attribute at all, and they haven’t been evaluated already.
     */
    pf.getAllElements = function () {
        var elems = [],
            imgs = doc.getElementsByTagName("img");

        for (var h = 0, len = imgs.length; h < len; h++) {
            var currImg = imgs[h];

            if (currImg.parentNode.nodeName.toUpperCase() === "PICTURE" || currImg.getAttribute("srcset") !== null || currImg[pf.ns] && currImg[pf.ns].srcset !== null) {
                elems.push(currImg);
            }
        }
        return elems;
    };

    pf.getMatch = function (img, picture) {
        var sources = picture.childNodes,
            match;

        // Go through each child, and if they have media queries, evaluate them
        for (var j = 0, slen = sources.length; j < slen; j++) {
            var source = sources[j];

            // ignore non-element nodes
            if (source.nodeType !== 1) {
                continue;
            }

            // Hitting the `img` element that started everything stops the search for `sources`.
            // If no previous `source` matches, the `img` itself is evaluated later.
            if (source === img) {
                return match;
            }

            // ignore non-`source` nodes
            if (source.nodeName.toUpperCase() !== "SOURCE") {
                continue;
            }
            // if it's a source element that has the `src` property set, throw a warning in the console
            if (source.getAttribute("src") !== null && typeof console !== undefined) {
                console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
            }

            var media = source.getAttribute("media");

            // if source does not have a srcset attribute, skip
            if (!source.getAttribute("srcset")) {
                continue;
            }

            // if there's no media specified, OR w.matchMedia is supported
            if (!media || pf.matchesMedia(media)) {
                var typeSupported = pf.verifyTypeSupport(source);

                if (typeSupported === true) {
                    match = source;
                    break;
                } else if (typeSupported === "pending") {
                    return false;
                }
            }
        }

        return match;
    };

    function picturefill(opt) {
        var elements,
            element,
            parent,
            firstMatch,
            candidates,
            options = opt || {};

        elements = options.elements || pf.getAllElements();

        // Loop through all elements
        for (var i = 0, plen = elements.length; i < plen; i++) {
            element = elements[i];
            parent = element.parentNode;
            firstMatch = undefined;
            candidates = undefined;

            // immediately skip non-`img` nodes
            if (element.nodeName.toUpperCase() !== "IMG") {
                continue;
            }

            // expando for caching data on the img
            if (!element[pf.ns]) {
                element[pf.ns] = {};
            }

            // if the element has already been evaluated, skip it unless
            // `options.reevaluate` is set to true ( this, for example,
            // is set to true when running `picturefill` on `resize` ).
            if (!options.reevaluate && element[pf.ns].evaluated) {
                continue;
            }

            // if `img` is in a `picture` element
            if (parent && parent.nodeName.toUpperCase() === "PICTURE") {

                // IE9 video workaround
                pf.removeVideoShim(parent);

                // return the first match which might undefined
                // returns false if there is a pending source
                // TODO the return type here is brutal, cleanup
                firstMatch = pf.getMatch(element, parent);

                // if any sources are pending in this picture due to async type test(s)
                // remove the evaluated attr and skip for now ( the pending test will
                // rerun picturefill on this element when complete)
                if (firstMatch === false) {
                    continue;
                }
            } else {
                firstMatch = undefined;
            }

            // Cache and remove `srcset` if present and we’re going to be doing `picture`/`srcset`/`sizes` polyfilling to it.
            if (parent && parent.nodeName.toUpperCase() === "PICTURE" || !pf.sizesSupported && element.srcset && regWDesc.test(element.srcset)) {
                pf.dodgeSrcset(element);
            }

            if (firstMatch) {
                candidates = pf.processSourceSet(firstMatch);
                pf.applyBestCandidate(candidates, element);
            } else {
                // No sources matched, so we’re down to processing the inner `img` as a source.
                candidates = pf.processSourceSet(element);

                if (element.srcset === undefined || element[pf.ns].srcset) {
                    // Either `srcset` is completely unsupported, or we need to polyfill `sizes` functionality.
                    pf.applyBestCandidate(candidates, element);
                } // Else, resolution-only `srcset` is supported natively.
            }

            // set evaluated to true to avoid unnecessary reparsing
            element[pf.ns].evaluated = true;
        }
    }

    /**
     * Sets up picture polyfill by polling the document and running
     * the polyfill every 250ms until the document is ready.
     * Also attaches picturefill on resize
     */
    function runPicturefill() {
        pf.initTypeDetects();
        picturefill();
        var intervalId = setInterval(function () {
            // When the document has finished loading, stop checking for new images
            // https://github.com/ded/domready/blob/master/ready.js#L15
            picturefill();

            if (/^loaded|^i|^c/.test(doc.readyState)) {
                clearInterval(intervalId);
                return;
            }
        }, 250);

        var resizeTimer;
        var handleResize = function handleResize() {
            picturefill({ reevaluate: true });
        };
        function checkResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 60);
        }

        if (w.addEventListener) {
            w.addEventListener("resize", checkResize, false);
        } else if (w.attachEvent) {
            w.attachEvent("onresize", checkResize);
        }
    }

    runPicturefill();

    /* expose methods for testing */
    picturefill._ = pf;

    expose(picturefill);
})(window, window.document, new window.Image());

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
})();

hsr = hsr || {};

hsr.blog = (function (window, undefined) {

    var init = undefined,
        buildBlogPostBLocks = undefined,
        addClickHandler = undefined,
        getAjax = undefined;

    var bodyElement = document.querySelector('body');

    // let urlPrefix = 'http://localhost:8888/';
    // var urlPrefix = 'http://66.147.244.54/~stupidw2/';
    // let urlPrefix = 'http://www.highlight-science-writing.com/';
    var urlPrefix = 'http://www.fredericaerts.com/external/projects/highlight-science-writing/';

    init = function () {
        buildBlogPostBLocks();
    };

    buildBlogPostBLocks = function () {
        var blogPostsContainer = document.querySelector('.js-blogposts-container');
        var blogPostTemplate = document.querySelector('.js-blog-post-template');

        getAjax(urlPrefix + 'blog/backend/handler.php?property=meta', function (data) {
            var metaData = JSON.parse(data);
            var metaDataArray = [];
            // convert data to Array of objects
            Object.keys(metaData).forEach(function (key) {
                metaDataArray.push(metaData[key + '']);
            });

            // make date property a proper Date object
            metaDataArray.map(function (metaData) {
                var dateValues = metaData.date.split('/');
                metaData.date = new Date(dateValues[2], dateValues[1] - 1, dateValues[0]);
                return metaData;
            });

            // sort on date
            metaDataArray.sort(function (a, b) {
                return b.date - a.date;
            });

            metaDataArray.forEach(function (metaData) {
                // create blogpost blocks
                var blogPostPlaceholder = blogPostTemplate.cloneNode(true);
                var titleElement = blogPostPlaceholder.querySelector('.js-blog-post-title');
                var dateElement = blogPostPlaceholder.querySelector('.js-blog-post-date');
                var introElement = blogPostPlaceholder.querySelector('.js-blog-post-description');

                titleElement.innerHTML = metaData.title + titleElement.innerHTML;
                dateElement.textContent = formatDate(metaData.date);
                introElement.textContent = metaData.description;

                // add clickhandler to blogpost => content loaded & it expands
                addClickHandler(blogPostPlaceholder.querySelector('.js-blog-post'), metaData);

                // remove original template
                blogPostsContainer.appendChild(blogPostPlaceholder);
            });
            blogPostTemplate.parentNode.removeChild(blogPostTemplate);
        });

        function formatDate(date) {
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var day = date.getDate();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();

            return monthNames[monthIndex] + ' ' + day + ', ' + year;
        }
    };

    addClickHandler = function (blogpost, metaData) {
        var blogPostContentElement = blogpost.querySelector('.js-blog-post-content');
        var blogPostIntroElement = blogpost.querySelector('.js-blog-post-intro');
        var blogPostSpinnerElement = blogpost.querySelector('.js-spinner');

        blogpost.addEventListener('click', function (event) {
            if (!blogpost.classList.contains('active')) {
                bodyElement.style.overflow = 'hidden';
                // set to position fixed
                var blogPostOffset = blogpost.getBoundingClientRect();
                var blogPostDimensions = {
                    width: blogpost.offsetWidth,
                    height: blogpost.offsetHeight
                };
                blogpost.classList.add('active');
                blogpost.style.width = blogPostDimensions.width + 'px';
                blogpost.style.height = blogpost.parentNode.style.height = blogPostDimensions.height + 'px';
                blogpost.style.top = blogPostOffset.top + 'px';
                blogpost.style.left = blogPostOffset.left + 'px';

                // make full screen
                window.setTimeout(function () {
                    blogpost.style.top = '0';
                    blogpost.style.left = '0';
                    blogpost.style.width = window.innerWidth + 'px';
                    blogpost.style.height = window.innerHeight + 'px';
                }, 50);

                window.setTimeout(function () {
                    blogpost.classList.add('positioned');
                }, 300);

                var closeElement = blogpost.getElementsByTagName('h1')[0].getElementsByTagName('span')[0];
                closeElement.blogPostOffset = blogPostOffset;
                closeElement.blogPostDimensions = blogPostDimensions;
                closeElement.removeEventListener('click', closeBlogPost);
                closeElement.addEventListener('click', closeBlogPost);

                blogPostIntroElement.style.display = 'none';
                blogPostSpinnerElement.style.display = 'inline-block';
                setTimeout(function () {
                    blogPostSpinnerElement.style.display = 'inline-block';
                    setTimeout(function () {
                        blogPostSpinnerElement.classList.add('active');
                    }, 50);
                }, 250);
                // get content
                getAjax(urlPrefix + 'blog/backend/handler.php?property=body&folder=' + metaData.folder, function (data) {
                    var bodyHtml = data;
                    blogPostSpinnerElement.classList.remove('active');
                    setTimeout(function () {
                        // wait for spinner fade out
                        blogPostSpinnerElement.style.display = 'none';
                        blogPostContentElement.innerHTML = bodyHtml;
                        blogPostContentElement.classList.add('active');
                    }, 300);
                });
            }
        });

        function closeBlogPost(event) {
            blogPostContentElement.innerHTML = "";
            blogPostIntroElement.style.display = 'block';
            blogpost.style.top = event.target.blogPostOffset.top + 'px';
            blogpost.style.left = event.target.blogPostOffset.left + 'px';
            blogpost.style.width = event.target.blogPostDimensions.width + 'px';
            blogpost.style.height = event.target.blogPostDimensions.height + 'px';
            blogpost.classList.remove('positioned');

            window.setTimeout(function () {
                bodyElement.style.overflow = '';
                blogpost.classList.remove('active');
            }, 300);
            event.stopPropagation();
        }
    };

    getAjax = function (url, success) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState > 3 && xhr.status == 200) success(xhr.responseText);
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        return xhr;
    };

    return {
        init: init
    };
})(window);

hsr = hsr || {};

hsr.contactForm = (function (window, undefined) {

    var init = undefined,
        addEventListeners = undefined;

    // let urlPrefix = 'http://localhost:8888/';
    // var urlPrefix = 'http://66.147.244.54/~stupidw2/';
    // let urlPrefix = 'http://www.highlight-science-writing.com/';
    var urlPrefix = 'http://www.fredericaerts.com/external/projects/highlight-science-writing/';

    var contactForm = document.querySelector('.contact-form'),
        inputFieldElements = [].slice.call(document.querySelectorAll('.contact-form .input__field')),
        inputHoneypotField = document.querySelector('.contact-form #input-honeypot'),
        inputNameField = document.querySelector('.contact-form #input-name'),
        inputEmailField = document.querySelector('.contact-form #input-email'),
        inputMessageField = document.querySelector('.contact-form #input-message'),
        submitButton = document.querySelector('.contact-form .js-submit-contact-form');

    init = function () {
        addEventListeners();
    };

    addEventListeners = function () {
        inputFieldElements.forEach(function (inputField) {
            // in case the input is already filled..
            if (inputField.value.trim() !== '') {
                inputField.parentNode.classList.add('js-input-filled');
            }
            inputField.addEventListener('focus', onInputFocus);
            inputField.addEventListener('blur', onInputBlur);
        });

        if (submitButton) {
            submitButton.addEventListener('click', onFormSubmit);
        }

        // HANDLERS
        function onInputFocus(event) {
            event.target.parentNode.classList.add('js-input-filled');
            event.target.parentNode.classList.remove('js-empty');
            event.target.parentNode.classList.remove('js-invalid');
        }

        function onInputBlur(event) {
            if (event.target.value.trim() === '') {
                event.target.parentNode.classList.remove('js-input-filled');
            }
        }

        function onFormSubmit(event) {
            submitButton.removeEventListener('click', onFormSubmit);
            var isNameEmpty = inputNameField.value.trim() === '',
                isEmailEmpty = inputEmailField.value.trim() === '',
                isEmailInvalid = validateEmail(inputEmailField.value.trim()),
                isMessageEmpty = inputMessageField.value.trim() === '';

            inputNameField.parentNode.classList.remove('js-empty');
            inputEmailField.parentNode.classList.remove('js-empty');
            inputEmailField.parentNode.classList.remove('js-invalid');
            inputMessageField.parentNode.classList.remove('js-empty');

            // handle error message Name
            if (isNameEmpty) {
                inputNameField.parentNode.classList.add('js-empty');
            }

            // handle error message Email
            if (isEmailEmpty) {
                inputEmailField.parentNode.classList.add('js-empty');
            } else if (isEmailInvalid) {
                inputEmailField.parentNode.classList.add('js-invalid');
            }

            // handle error message Message
            if (isMessageEmpty) {
                inputMessageField.parentNode.classList.add('js-empty');
            }

            if (!isNameEmpty && !isEmailEmpty && !isEmailInvalid && !isMessageEmpty) {
                var url = urlPrefix + 'backend/contact.php';
                // let url = 'http://localhost:8888/backend/contact.php';
                postAjax(url, serialize(inputFieldElements.concat(inputHoneypotField)), function (data) {
                    if (data === 'nok') {
                        var feedbackTitleElement = document.querySelector('.contact-form__thank-you__title');
                        var feedbackTextElement = document.querySelector('.contact-form__thank-you__text');
                        feedbackTitleElement.textContent = 'Oops.';
                        feedbackTextElement.innerHTML = 'Something went wrong. Please contact us directly via <a href="mailto:info@highlight-science-writing.com" target="_top">info@highlight-science-writing.com</a>';
                    }
                    contactForm.classList.add('sent');
                });
            } else {
                submitButton.addEventListener('click', onFormSubmit);
            }

            event.preventDefault();
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return !re.test(email);
        }

        function serialize(inputFields) {
            var s = [];
            inputFields.forEach(function (field) {
                if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                    if (field.type != 'checkbox' && field.type != 'radio' || field.checked) {
                        s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
                    }
                }
            });
            return s.join('&').replace(/%20/g, '+');
        }

        function postAjax(url, data, success) {
            var params = typeof data == 'string' ? data : Object.keys(data).map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
            }).join('&');

            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xhr.open('POST', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState > 3 && xhr.status == 200) {
                    success(xhr.responseText);
                }
            };
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(params);
            return xhr;
        }
    };

    return {
        init: init
    };
})(window);

hsr = hsr || {};

hsr.flipside = (function (window, undefined) {

    var init = undefined,
        closeTiles = undefined;

    var addEventListeners = undefined;

    // DOM variable
    var servicesPage = document.querySelector('.js-services');
    var flipsideTileElements = [].slice.call(document.querySelectorAll('.flipside'));

    init = function () {
        addEventListeners();
    };

    addEventListeners = function () {
        flipsideTileElements.forEach(function (tile) {
            var tileFront = tile.querySelector('.flipside__front'),
                btnClose = tile.querySelector('.js-close-flip'),
                tileContent = tile.querySelector('.flipside__back__content');

            tileFront.addEventListener('click', function (event) {
                var windowWidth = window.innerWidth;

                var isAnotherTileOpened = flipsideTileElements.filter(function (tile) {
                    return tile.classList.contains('is-open');
                })[0];

                if (isAnotherTileOpened) {
                    return;
                }
                flipsideTileElements.forEach(function (tile) {
                    tile.classList.add('blurred');
                });
                tile.classList.remove('blurred');
                tile.classList.add('is-open');
                if (windowWidth < 768) {
                    tile.style.width = windowWidth - 30 + 'px';
                    tileContent.style.width = windowWidth - 80 + 'px';
                } else {
                    tile.removeAttribute('style');
                    tileContent.removeAttribute('style');
                }
                servicesPage.classList.add('tile-open');
                event.stopPropagation();
            });

            btnClose.addEventListener('click', function (event) {
                flipsideTileElements.forEach(function (tile) {
                    tile.classList.remove('blurred');
                });
                tile.classList.remove('is-open');
                tile.removeAttribute('style');
                tileContent.removeAttribute('style');
                servicesPage.classList.remove('tile-open');
                event.stopPropagation();
            });
        });
    };

    closeTiles = function () {
        flipsideTileElements.forEach(function (tile) {
            var tileContent = tile.querySelector('.flipside__back__content');
            tile.classList.remove('blurred');
            tile.classList.remove('is-open');
            tile.removeAttribute('style');
            tileContent.removeAttribute('style');
            servicesPage.classList.remove('tile-open');
        });
    };

    return {
        init: init,
        closeTiles: closeTiles
    };
})(window);

hsr = hsr || {};

hsr.helpers = (function (window, undefined) {

    return {};
})(window);

hsr = hsr || {};

hsr.nav = (function (window, undefined) {

    var init = undefined;

    var addMobileMenuEvenListeners = undefined,
        addHeaderLogoEventListener = undefined,
        addPageNavEventListeners = undefined;

    var initPage = undefined;

    var bgMarkerElement = document.querySelector('.js-bg-marker');
    var mobileMenuElement = document.querySelector('.js-header__mobile-menu');
    var pageElements = [// index of array elements is data-target-index value
    document.querySelector('.js-services'), document.querySelector('.js-clients'), document.querySelector('.js-blog'), document.querySelector('.js-about'), document.querySelector('.js-contact')];
    var activePageIndex = -1; // landing page

    // Cached DOM variables
    var bodyElement = document.querySelector('body');
    var headerButtonWrapperElement = document.querySelector('.js-nav-link-wrapper');
    var headerButtonElementsArray = [].slice.call(document.querySelectorAll('.js-header__nav__link'));

    init = function () {
        bodyElement.classList.add('on-landing-page');
        bodyElement.style.height = window.innerHeight + 'px';
        addMobileMenuEvenListeners();
        addHeaderLogoEventListener();
        addPageNavEventListeners();
    };

    addMobileMenuEvenListeners = function () {
        mobileMenuElement.addEventListener('click', function () {
            if (mobileMenuElement.classList.contains('open')) {
                mobileMenuElement.classList.remove('open');
            } else {
                mobileMenuElement.classList.add('open');
            }
        });
    };

    addHeaderLogoEventListener = function () {
        var headerLogoElement = document.querySelector('.js-header__logo');
        headerLogoElement.addEventListener('click', function () {
            // back to landing page
            initPage(-1);
        });
    };

    addPageNavEventListeners = function () {
        var heroButtonElementsArray = [].slice.call(document.querySelectorAll('.js-hero__buttons button')),
            pageNavLinks = [].slice.call(document.querySelectorAll('.js-nav-link'));
        var navButtonElementsArray = headerButtonElementsArray.concat(heroButtonElementsArray, pageNavLinks);
        navButtonElementsArray.forEach(function (button) {
            button.addEventListener('click', function (event) {
                var targetIndex = parseInt(event.target.getAttribute('data-target-index'), 10);
                initPage(targetIndex);
            });
        });
    };

    initPage = function (targetPageIndex) {
        // navigate to landing page is handled by function addHeaderLogoEventListener
        mobileMenuElement.classList.remove('open');

        if (targetPageIndex === activePageIndex) {
            return;
        }

        var currentPageElement = pageElements[activePageIndex];
        var targetPageElement = pageElements[targetPageIndex];

        removeActiveClassFromNavlinks();

        if (targetPageIndex < 0) {
            // navigate back to landing page
            bodyElement.classList.add('on-landing-page');
            bodyElement.style.height = window.innerHeight + 'px';
            headerButtonWrapperElement.classList.remove('page-from-left', 'page-from-right');
            currentPageElement.classList.add('active--from-bottom');
            currentPageElement.classList.remove('positioned', 'active--from-right', 'active--from-left');
            setTimeout(function () {
                currentPageElement.classList.remove('active', 'active--from-bottom');
                bgMarkerElement.classList.add('landing-page');
            }, 100);
        } else if (activePageIndex < 0) {
            // current page is landing page => new page moves in from bottom
            removeActiveClassFromNavlinks();

            targetPageElement.classList.add('active', 'active--from-bottom');
            bgMarkerElement.classList.remove('landing-page');
            setTimeout(function () {
                targetPageElement.classList.add('positioned');
                addActiveClassToNavlink();
                bodyElement.classList.remove('on-landing-page');
                bodyElement.style.height = '100%';
            }, 700);
        } else if (targetPageIndex < activePageIndex) {
            // new page moves in from left
            headerButtonWrapperElement.classList.remove('page-from-left');
            headerButtonWrapperElement.classList.add('page-from-right');
            removeActiveClassFromNavlinks();

            currentPageElement.classList.add('active--from-right');
            currentPageElement.classList.remove('positioned', 'active--from-bottom', 'active--from-left');
            setTimeout(function () {
                currentPageElement.classList.remove('active', 'active--from-right');
                targetPageElement.classList.add('active', 'active--from-left');
                setTimeout(function () {
                    targetPageElement.classList.add('positioned');
                    addActiveClassToNavlink();
                }, 100);
            }, 300);
        } else {
            // new page moves in from right
            headerButtonWrapperElement.classList.remove('page-from-right');
            headerButtonWrapperElement.classList.add('page-from-left');
            removeActiveClassFromNavlinks();

            currentPageElement.classList.add('active--from-left');
            currentPageElement.classList.remove('positioned', 'active--from-bottom', 'active--from-right');
            setTimeout(function () {
                currentPageElement.classList.remove('active', 'active--from-left');
                targetPageElement.classList.add('active', 'active--from-right');
                setTimeout(function () {
                    targetPageElement.classList.add('positioned');
                    addActiveClassToNavlink();
                }, 100);
            }, 300);
        }

        activePageIndex = targetPageIndex;

        function removeActiveClassFromNavlinks() {
            headerButtonElementsArray.forEach(function (button) {
                button.classList.remove('active');
            });
        }

        function addActiveClassToNavlink() {
            headerButtonElementsArray.filter(function (button) {
                return parseInt(button.getAttribute('data-target-index'), 10) === targetPageIndex;
            })[0].classList.add('active');
        }
    };

    return {
        init: init
    };
})(window);

'use strict';
var hsr = hsr || {};

hsr.app = (function (window, undefined) {

    // On Dom ready
    var init = function init() {
        hsr.nav.init();
        hsr.contactForm.init();
        hsr.blog.init();
        hsr.flipside.init();
        attachWindowEventHandlers();
    };

    // On All loaded
    // initOnload = () => {
    //     appScroll();
    // };

    function attachWindowEventHandlers() {
        window.addEventListener('click', function clickEventHandler(event) {
            hsr.flipside.closeTiles();
        });
    }

    // On Scroll
    // appScroll = () => {
    //     let _onScroll;

    //     _onScroll = debounce(() => {
    //         console.log('scrolling');
    //     }, 50);

    //     $(window).scroll(() =>{
    //         _onScroll();
    //     });
    // };

    // debounce = (func, wait, immediate) => {
    //     let timeout;
    //     return (...args) => {
    //         let context = this;
    //         let later = () => {
    //             timeout = null;
    //             if (!immediate) {
    //                 func.apply(context, args);
    //             }
    //         };
    //         let callNow = immediate && !timeout;
    //         clearTimeout(timeout);
    //         timeout = setTimeout(later, wait);
    //         if (callNow) {
    //             func.apply(context, args);
    //         }
    //     };
    // };

    return {
        init: init
        // initOnload: initOnload
    };
})(window);

// Dom ready
document.addEventListener('DOMContentLoaded', function () {
    hsr.app.init();
}, false);

// All loaded
// $(window).load(() => {
//     hsr.app.initOnload();
// });