/**
 * VPAID 2.0 Playable Ad Unit
 * Loads an interactive HTML overlay on top of video playback
 *
 * Self-hosted version - all assets are relative to this file's location
 */

var VPAIDPlayableAd = function() {
  // VPAID required properties
  this.slot_ = null;
  this.videoSlot_ = null;
  this.eventsCallbacks_ = {};
  this.attributes_ = {
    companions: '',
    desiredBitrate: 256,
    duration: 30,
    expanded: false,
    height: 0,
    icons: '',
    linear: true,
    remainingTime: 30,
    skippableState: false,
    viewMode: 'normal',
    width: 0,
    volume: 1.0
  };

  // Custom properties
  this.baseUrl_ = this.getBaseUrl_();
  this.videoUrl_ = this.baseUrl_ + 'cookingVideo.mp4';
  // Load the HTML5 game as the overlay
  this.overlayUrl_ = 'https://tech-iion.github.io/advertiser-creatives/allkindsLandscape/';
  this.overlayIframe_ = null;
  this.started_ = false;
  this.clickThrough_ = 'https://yourdomain.com/clickthrough';
};

/**
 * Get the base URL of this script (for relative asset paths)
 */
VPAIDPlayableAd.prototype.getBaseUrl_ = function() {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    if (src && src.indexOf('vpaid_playable.js') !== -1) {
      return src.substring(0, src.lastIndexOf('/') + 1);
    }
  }
  return '';
};

/**
 * VPAID 2.0 Required Methods
 */

// Returns the VPAID version
VPAIDPlayableAd.prototype.handshakeVersion = function(version) {
  return '2.0';
};

// Initialize the ad
VPAIDPlayableAd.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
  this.attributes_.width = width;
  this.attributes_.height = height;
  this.attributes_.viewMode = viewMode;
  this.attributes_.desiredBitrate = desiredBitrate;

  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;

  // Parse creative data if provided
  if (creativeData && creativeData.AdParameters) {
    try {
      var params = JSON.parse(creativeData.AdParameters);
      if (params.videoUrl) this.videoUrl_ = params.videoUrl;
      if (params.overlayUrl) this.overlayUrl_ = params.overlayUrl;
      if (params.clickThrough) this.clickThrough_ = params.clickThrough;
    } catch (e) {
      // Use defaults
    }
  }

  // Set up the video element
  if (this.videoSlot_) {
    this.videoSlot_.src = this.videoUrl_;
    this.videoSlot_.addEventListener('timeupdate', this.onTimeUpdate_.bind(this));
    this.videoSlot_.addEventListener('ended', this.onVideoEnded_.bind(this));
    this.videoSlot_.addEventListener('error', this.onVideoError_.bind(this));
  }

  this.callEvent_('AdLoaded');
};

// Start the ad
VPAIDPlayableAd.prototype.startAd = function() {
  if (this.started_) return;
  this.started_ = true;

  // Start video playback
  if (this.videoSlot_) {
    this.videoSlot_.play();
  }

  // Create and inject the interactive overlay
  this.createOverlay_();

  this.callEvent_('AdStarted');
  this.callEvent_('AdImpression');
  this.callEvent_('AdVideoStart');
};

// Stop the ad
VPAIDPlayableAd.prototype.stopAd = function() {
  this.cleanup_();
  this.callEvent_('AdStopped');
};

// Skip the ad (if skippable)
VPAIDPlayableAd.prototype.skipAd = function() {
  if (this.attributes_.skippableState) {
    this.callEvent_('AdSkipped');
    this.stopAd();
  }
};

// Resize the ad
VPAIDPlayableAd.prototype.resizeAd = function(width, height, viewMode) {
  this.attributes_.width = width;
  this.attributes_.height = height;
  this.attributes_.viewMode = viewMode;

  if (this.overlayIframe_) {
    this.overlayIframe_.style.width = width + 'px';
    this.overlayIframe_.style.height = height + 'px';
  }

  this.callEvent_('AdSizeChange');
};

// Pause the ad
VPAIDPlayableAd.prototype.pauseAd = function() {
  if (this.videoSlot_) {
    this.videoSlot_.pause();
  }
  this.callEvent_('AdPaused');
};

// Resume the ad
VPAIDPlayableAd.prototype.resumeAd = function() {
  if (this.videoSlot_) {
    this.videoSlot_.play();
  }
  this.callEvent_('AdPlaying');
};

// Expand the ad
VPAIDPlayableAd.prototype.expandAd = function() {
  this.attributes_.expanded = true;
  this.callEvent_('AdExpandedChange');
};

// Collapse the ad
VPAIDPlayableAd.prototype.collapseAd = function() {
  this.attributes_.expanded = false;
  this.callEvent_('AdExpandedChange');
};

/**
 * VPAID 2.0 Required Property Getters
 */

VPAIDPlayableAd.prototype.getAdLinear = function() {
  return this.attributes_.linear;
};

VPAIDPlayableAd.prototype.getAdWidth = function() {
  return this.attributes_.width;
};

VPAIDPlayableAd.prototype.getAdHeight = function() {
  return this.attributes_.height;
};

VPAIDPlayableAd.prototype.getAdExpanded = function() {
  return this.attributes_.expanded;
};

VPAIDPlayableAd.prototype.getAdSkippableState = function() {
  return this.attributes_.skippableState;
};

VPAIDPlayableAd.prototype.getAdRemainingTime = function() {
  if (this.videoSlot_) {
    return this.videoSlot_.duration - this.videoSlot_.currentTime;
  }
  return this.attributes_.remainingTime;
};

VPAIDPlayableAd.prototype.getAdDuration = function() {
  if (this.videoSlot_) {
    return this.videoSlot_.duration;
  }
  return this.attributes_.duration;
};

VPAIDPlayableAd.prototype.getAdVolume = function() {
  if (this.videoSlot_) {
    return this.videoSlot_.volume;
  }
  return this.attributes_.volume;
};

VPAIDPlayableAd.prototype.setAdVolume = function(value) {
  this.attributes_.volume = value;
  if (this.videoSlot_) {
    this.videoSlot_.volume = value;
  }
  this.callEvent_('AdVolumeChange');
};

VPAIDPlayableAd.prototype.getAdCompanions = function() {
  return this.attributes_.companions;
};

VPAIDPlayableAd.prototype.getAdIcons = function() {
  return this.attributes_.icons;
};

/**
 * VPAID 2.0 Event Subscription
 */

VPAIDPlayableAd.prototype.subscribe = function(callback, eventName, context) {
  this.eventsCallbacks_[eventName] = callback.bind(context);
};

VPAIDPlayableAd.prototype.unsubscribe = function(eventName) {
  this.eventsCallbacks_[eventName] = null;
};

/**
 * Internal Methods
 */

// Create the interactive overlay iframe
VPAIDPlayableAd.prototype.createOverlay_ = function() {
  if (!this.slot_) return;

  // Create container for overlay
  var container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000;';

  // Create iframe for the playable content
  this.overlayIframe_ = document.createElement('iframe');
  this.overlayIframe_.src = this.overlayUrl_;
  this.overlayIframe_.style.cssText = 'width:100%;height:100%;border:none;pointer-events:auto;background:transparent;';
  this.overlayIframe_.setAttribute('allowfullscreen', 'true');
  this.overlayIframe_.setAttribute('allow', 'autoplay; fullscreen');

  // Listen for messages from the overlay
  window.addEventListener('message', this.onOverlayMessage_.bind(this));

  container.appendChild(this.overlayIframe_);
  this.slot_.appendChild(container);
};

// Handle messages from the overlay iframe
VPAIDPlayableAd.prototype.onOverlayMessage_ = function(event) {
  if (!event.data) return;

  var data = event.data;

  // Handle SIMID-style messages or custom messages
  if (data.type === 'clickthrough' || data.action === 'clickthrough') {
    this.callEvent_('AdClickThru', this.clickThrough_, '', true);
  } else if (data.type === 'close' || data.action === 'close') {
    this.stopAd();
  } else if (data.type === 'interaction' || data.action === 'interaction') {
    this.callEvent_('AdInteraction', data.id || 'overlay_interaction');
  }
};

// Video time update handler - fire quartile events
VPAIDPlayableAd.prototype.onTimeUpdate_ = function() {
  if (!this.videoSlot_) return;

  var currentTime = this.videoSlot_.currentTime;
  var duration = this.videoSlot_.duration;
  var percent = (currentTime / duration) * 100;

  this.attributes_.remainingTime = duration - currentTime;

  // Fire quartile events
  if (percent >= 25 && !this.firedFirstQuartile_) {
    this.firedFirstQuartile_ = true;
    this.callEvent_('AdVideoFirstQuartile');
  }
  if (percent >= 50 && !this.firedMidpoint_) {
    this.firedMidpoint_ = true;
    this.callEvent_('AdVideoMidpoint');
  }
  if (percent >= 75 && !this.firedThirdQuartile_) {
    this.firedThirdQuartile_ = true;
    this.callEvent_('AdVideoThirdQuartile');
  }
};

// Video ended handler
VPAIDPlayableAd.prototype.onVideoEnded_ = function() {
  this.callEvent_('AdVideoComplete');
  this.stopAd();
};

// Video error handler
VPAIDPlayableAd.prototype.onVideoError_ = function(e) {
  this.callEvent_('AdError', 'Video playback error');
};

// Cleanup resources
VPAIDPlayableAd.prototype.cleanup_ = function() {
  if (this.overlayIframe_ && this.overlayIframe_.parentNode) {
    this.overlayIframe_.parentNode.removeChild(this.overlayIframe_);
  }
  if (this.videoSlot_) {
    this.videoSlot_.pause();
    this.videoSlot_.src = '';
  }
  window.removeEventListener('message', this.onOverlayMessage_.bind(this));
};

// Fire VPAID event
VPAIDPlayableAd.prototype.callEvent_ = function(eventType) {
  if (this.eventsCallbacks_[eventType]) {
    var args = Array.prototype.slice.call(arguments, 1);
    this.eventsCallbacks_[eventType].apply(this, args);
  }
};

// VPAID entry point - the player looks for this function
var getVPAIDAd = function() {
  return new VPAIDPlayableAd();
};
