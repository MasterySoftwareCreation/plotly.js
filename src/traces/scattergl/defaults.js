/**
* Copyright 2012-2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var Lib = require('../../lib');

var constants = require('../scatter/constants');
var subTypes = require('../scatter/subtypes');
var handleXYDefaults = require('../scatter/xy_defaults');
var handleMarkerDefaults = require('../scatter/marker_defaults');
var handleLineDefaults = require('../scatter/line_defaults');
var handleFillColorDefaults = require('../scatter/fillcolor_defaults');
var errorBarsSupplyDefaults = require('../../components/errorbars/defaults');

var attributes = require('./attributes');


module.exports = function supplyDefaults(traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    var isOpen = traceIn.marker ? /-open/.test(traceIn.marker.symbol) : false;
    var isBubble = subTypes.isBubble(traceIn);

    var len = handleXYDefaults(traceIn, traceOut, layout, coerce);
    if(!len) {
        traceOut.visible = false;
        return;
    }

    coerce('text');
    coerce('mode', len < constants.PTS_LINESONLY ? 'lines+markers' : 'lines');

    if(subTypes.hasLines(traceOut)) {
        coerce('connectgaps');
        handleLineDefaults(traceIn, traceOut, defaultColor, layout, coerce);
    }

    var dfltHoverOn = [];

    if(subTypes.hasMarkers(traceOut)) {
        handleMarkerDefaults(traceIn, traceOut, defaultColor, layout, coerce);
        coerce('marker.line.width', isOpen || isBubble ? 1 : 0);
        dfltHoverOn.push('points');
    }

    coerce('fill');
    if(traceOut.fill !== 'none') {
        handleFillColorDefaults(traceIn, traceOut, defaultColor, coerce);
    }

    if(traceOut.fill === 'tonext' || traceOut.fill === 'toself') {
        dfltHoverOn.push('fills');
    }

    coerce('hoveron', dfltHoverOn.join('+') || 'points');

    errorBarsSupplyDefaults(traceIn, traceOut, defaultColor, {axis: 'y'});
    errorBarsSupplyDefaults(traceIn, traceOut, defaultColor, {axis: 'x', inherit: 'y'});

    Lib.coerceSelectionMarkerOpacity(traceOut, coerce);
};
