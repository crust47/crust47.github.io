var Config = {};

//base:
Config.debug = 0;
Config.framerate = 60;

//piece:
Config.colors = ['#FFFFFF', '#30D1FF','#00009F'];
Config.ratios = [0,.5,1];

Config.zoomSpeed = 1.003;//per frame, multiplier. Default zoomspeed after first click/split.
Config.zoomSpeedParallax = 1.008;
Config.zoomSpeedParallaxDuration = 300;//in frames

Config.splitMin = 5;
Config.splitMax = 7;

Config.angleRandomFactor = .5;//0..1

Config.autoModeInteractive = false;//enable interaction in automode?
Config.autoModeStartAfter = -1;//in msecs, use -1 for no automode
Config.autoModeIntervalMin = 1800;//in msecs
Config.autoModeIntervalMax = 2800;//in msecs

//Setting to have first split in automode NOT in center:
Config.autoModeFirstSplitMinDistanceToCenter = .05;//relative to screen dimensions

//First, a random point in the window is chosen (with a preference for the viewport center: autoModePreferViewportCenterFactor)
//Then we find the polygon at that point
//Second, a point in that polygon is chosen (with a preference for the polygon center: autoModePreferPolygonCenterFactor)
Config.autoModeMaxDistanceToCenter = .25;// 0 .. 0.5,relative to screen dimensions. Use 0.5 for no max distance.
Config.autoModePreferViewportCenterFactor = 3;//exponential, 1..6 (1 : no preference)

