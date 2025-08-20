// old file https://gistcdn.githack.com/itaikeren/de68f042955b76076ed2cc1aa3673031/raw/1bd16b69150b7778ce8f738baad352c1c5f74a66/nectar.js
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

 window.uuidv4 = uuidv4; 

const isBase64StrWhiteList = ["blog", "Outbrain", "DailyMorningBrew"];
const defaultMaxAge = 604800; // This is seconds, not milliseconds.

function getURLparams(paramsNames = null, url = window.location.href) {
  const regex = /[?&]+([^=&]+)=([^&#]*)/gi;
  const params = {};

  url.replace(regex, (param, key, value) => {
    if (!paramsNames || paramsNames === key || paramsNames.indexOf(key) > -1) {
      params[key] = value;
    }
  });

  return params;
}

function fromUrlParams(name, paramsNames, maxAge = false) {
  const currentValue = window.cookieManager?.get(name) || {};
  const params = getURLparams(paramsNames);

  // check if params is empty
  if (params === null || params === undefined || Object.keys(params).length === 0) {
    return;
  }

  params.createdAt = Date.now();
  const value = { ...currentValue, ...params }; // merge with current cookie

  window.cookieManager?.set(name, value, { path: "/", maxAge: maxAge || defaultMaxAge });
}

class Nectar {
  constructor() {
    this.isSessionStorageWork = !!(sessionStorage && sessionStorage.getItem);
    this.userId = null;
    this.userType = null;
    this.firedEvents = [];

    if (this.isSessionStorageWork) {
      this.ref = sessionStorage.ref || null;
      this.automationId = sessionStorage.aId || null;
      this.medium = sessionStorage.medium || null;
      this.nodeId = sessionStorage.nId || null;
      this.linkId = sessionStorage.linkId || null;
      this.lp_v = sessionStorage.lp_v || null;
      this.lp_p = sessionStorage.lp_p || null;
      this.funnel_id = sessionStorage.funnel_id || null;
      this.sessionId = sessionStorage.id || window.uuidv4(); // getting session id
      this.ad_id = sessionStorage.ad_id || null;
    } else {
      this.ref = null;
      this.automationId = null;
      this.medium = null;
      this.nodeId = null;
      this.linkId = null;
      this.lp_v = null;
      this.funnel_id = null;
      this.lp_p = null;
      this.sessionId = window.uuidv4();
      this.ad_id = null;
    }
  }

  init(url = window.location.href) {
    const urlParams = this.getURLparams(null, url);
    let {
      ref,
      medium,
      userId,
      nId,
      aId,
      adId,
      linkId,
      ad_id,
      lp_v,
      eb_sid,
      utm_medium,
      utm_source,
      utm_content,
      utm_campaign,
    } = urlParams;

    if (this.isSessionStorageWork) {
      sessionStorage.id = this.sessionId;
    } // setting session id

    eb_sid && this.setSessionId(eb_sid);

    // set session reference value
    if (ref || utm_content) {
      try {
        if (ref) {
          ref = this.isBase64Str(ref) && !isBase64StrWhiteList.includes(ref) ? window.atob(ref) : ref;
        }
        if (utm_content) {
          ref = utm_content;
        }
      } catch (error) {
        console.error(error);
      }
      this.setRef(ref);
    }

    // set session medium value
    medium ? this.setMedium(medium) : utm_medium && this.setMedium(utm_medium);

    // set session automationId
    aId ? this.setAutomationId(aId) : utm_source && utm_source === "hs_automation" && this.setAutomationId(utm_source);

    // set session nodeId
    nId && this.setNodeId(nId);

    // set link id
    linkId && this.setLinkId(linkId);

    // set landing page variant
    lp_v && this.setLpV(lp_v);

    ad_id ? this.setAdId(ad_id) : utm_campaign && this.setAdId(utm_campaign);

    if (ad_id) {
      this.setCalculatedSource("Ad");
    } else if (medium === "email") {
      this.setCalculatedSource("Email");
    } else if (lp_v) {
      this.setCalculatedSource("Lp");
    } else {
      this.setCalculatedSource("Organic");
    }

    // send notification event if user arrived from SMS
    if (medium === "SMS" && userId) {
      this.sendNotificationEvent(userId, "CLICK", "SMS");
    }

    // Setting HotJar Identify function
    if (window.hj) {
      window.hj("identify", this.userId, {
        sessionId: this.sessionId || null,
        ref: this.ref || null,
        medium: this.medium || null,
        nodeId: this.nId || null,
        userType: this.userType || null,
        adId: adId || ad_id || null,
        lp_v: this.lp_v || null,
        lp_p: this.lp_p || null,
      });
    }
  }

  setUser(userId, userEmail, userType) {
    this.userId = userId;
    this.userEmail = userEmail;
    this.userType = userType;

    if (userId != null) {
      const userTraits = { email: userEmail, type: userType };
      if (this.lp_v) {
        userTraits.lp_v = this.lp_v;
      }
      if (this.funnel_id) {
        userTraits.funnel_id = this.funnel_id;
      }
    }
  }

  resetUser() {
    this.setUser(null, null, null);
  }

  setRef(ref) {
    this.ref = ref;
    if (this.isSessionStorageWork) {
      sessionStorage.ref = ref;
    }
  }

  setAutomationId(aId) {
    this.automationId = aId;
    if (this.isSessionStorageWork) {
      sessionStorage.aId = aId;
    }
  }

  setNodeId(nId) {
    this.nodeId = nId;
    if (this.isSessionStorageWork) {
      sessionStorage.nId = nId;
    }
  }

  setMedium(medium) {
    this.medium = medium;
    if (this.isSessionStorageWork) {
      sessionStorage.medium = medium;
    }
  }

  setLinkId(linkId) {
    this.linkId = linkId;
    if (this.isSessionStorageWork) {
      sessionStorage.linkId = linkId;
    }
  }

  setLpV(lpV) {
    this.lp_v = lpV;
    if (this.isSessionStorageWork) {
      sessionStorage.lp_v = lpV;
    }
  }

  setAdId(adId) {
    this.ad_id = adId;
    if (this.isSessionStorageWork) {
      sessionStorage.ad_id = adId;
    }
  }

  setFunnelId(funnelId) {
    this.funnel_id = funnelId;
    if (this.isSessionStorageWork) {
      sessionStorage.funnel_id = funnelId;
    }
  }

  setLpP(lpP) {
    this.lp_p = lpP;
    if (this.isSessionStorageWork) {
      sessionStorage.lp_p = lpP;
    }
  }

  setSessionId(sessionId) {
    this.sessionId = sessionId;
    if (this.isSessionStorageWork) {
      sessionStorage.id = sessionId;
    }
  }

  setCalculatedSource(calculatedSource) {
    if (this.isSessionStorageWork) {
      sessionStorage.calculatedSource = calculatedSource;
    }
  }

  get eventMetaProperties() {
    return {
      ref: this.ref,
      medium: this.medium,
      session: this.sessionId,
      beemailAutomation: this.automationId,
      beemailNode: this.nodeId,
      linkId: this.linkId,
      lp_v: this.lp_v,
      funnel_id: this.funnel_id,
      isBeemailSession: !!(this.nodeId || this.automationId),
      browserProperties: {
        userAgent: navigator.userAgent || null,
      },
      ad_id: this.ad_id,
    };
  }

  async sendNotificationEvent(userId, type, medium) {
    let notificationIdentifier = this.ref || null;

    try {
      notificationIdentifier = window.atob(decodeURIComponent(this.ref));
    } catch (error) {
      console.error(error);
    }

    const notificationEventObj = {
      type,
      ebEnv: null,
      notificationIdentifier,
      userId: userId || this.userId,
      medium,
      session: this.sessionId,
      automationId: this.automationId,
      nodeId: this.nodeId,
    };

    fetch(`https://${window.gatewayUrl}/general/nectar/notification-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationEventObj),
    }).then((response) => response.json());
  }

  /**
   *  The userId is actually the leadId when firing for the "Onboarding - Start Funnel" - to track the events for mixpanel
   * @param {EVENT_TYPES} eventName
   * @param {PROPERTY_TYPES} eventProps
   * @param {string} userId
   * @param {string} userType
   */
  async sendEvent(eventName, eventProps = {}, userId = this.userId, userType = this.userType, sendOnce = false) {
    try {
      if (sendOnce && this.firedEvents.includes(eventName)) {
        return;
      }

      const eventObj = {
        userId,
        userType,
        name: eventName,
        properties: eventProps,
        time: Date.now(),
        ...this.eventMetaProperties,
      };

      if (this.ref) {
        eventObj.ref = this.ref;
      }

      if (!eventObj.userType) {
        console.error("Trying to fire event without userType", eventObj);
      }

      if (sendOnce) {
        this.firedEvents.push(eventName);
      }

      fetch(`https://${window.gatewayUrl}/general/nectar/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventObj),
      }).then((response) => response.json());
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *
   * @param {string} email
   * @param {EVENT_TYPES} eventName
   * @param {PROPERTY_TYPES} eventProps
   * @param {string} userId
   * @param {string} userType
   */
  async sendGeneralEvent(email, eventName, eventProps = {}, sendOnce = false) {
    try {
      if (sendOnce && this.firedEvents.includes(eventName)) {
        return;
      }

      const eventObj = {
        email,
        name: eventName,
        properties: eventProps,
        time: Date.now(),
        ...this.eventMetaProperties,
      };

      if (this.ref) {
        eventObj.ref = this.ref;
      }

      if (sendOnce) {
        this.firedEvents.push(eventName);
      }

      fetch(`https://${window.gatewayUrl}/general/nectar/general-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventObj),
      }).then((response) => response.json());
    } catch (error) {
      console.error(error);
    }
  }

  get USER_TYPE() {
    return Nectar.USER_TYPE;
  }

  get beemailAutomation() {
    return this.automationId;
  }

  get beemailNode() {
    return this.nodeId;
  }

  get notificationRef() {
    let notificationIdentifier = this.ref || null;
    try {
      notificationIdentifier = window.atob(this.ref);
    } catch (error) {
      console.error(error);
    }
    return notificationIdentifier;
  }

  getURLparams(paramsNames = null, url = window.location.href) {
    const regex = /[?&]+([^=&]+)=([^&#]*)/gi;
    const params = {};

    url.replace(regex, (param, key, value) => {
      if (!paramsNames || paramsNames?.includes(key)) {
        params[key] = decodeURIComponent(value);
      }
    });

    return params;
  }

  isBase64Str(str) {
    try {
      return btoa(atob(str)) === str;
    } catch (error) {
      return false;
    }
  }
}

Nectar.USER_TYPE = {
  EMPLOYEE: "Employee",
  INVESTOR: "Investor",
  UNKNOWN: "Unknown-Website",
};

function initNectar() {
  window.nectar = new Nectar();
  const urlParams = getURLparams();
  const url = urlParams.continueUrl ? decodeURIComponent(urlParams.continueUrl) : window.location.href;

  fromUrlParams('equitybeeLandingData', [
        'ref',
        'cat',
        'ad_id',
        'post_name',
        'funnel_id',
        'lp_v',
        'from_call',
        'refsdr',
        'linkId',
        'pt',
        'pn',
        'pme',
        'owner'
      ]);

  window.nectar.init(url);
  window.nectarInitialized = true;

  const { pathname } = window.location;

  window.nectar.sendEvent(
    "Website Page View",
    { page: pathname, lastClickReferrer: document.referrer || null },
    null,
    Nectar.USER_TYPE.UNKNOWN
  );
}

  const TIMEOUT_MS = 5000;
  let checkOptibase;
  let nectarInitiationStarted = false;

  // Start checking for Optibase
  checkOptibase = setInterval(() => {
    if (
      window.optibaseScriptLoaded === true &&
      window.optibaseInitialized === true &&
      !nectarInitiationStarted
    ) {
      nectarInitiationStarted = true; // Set flag before any async operations
      clearInterval(checkOptibase);

      const activeVariants = window.optibaseActiveVariants ?? undefined;
      if (activeVariants) {
        // Get Optibase test & variant IDs
        const testId = activeVariants?.[0]?.userFriendlyTestId || "test";
        const variantId =
          activeVariants?.[0]?.userFriendlyVariantId || "variant";
        sessionStorage.setItem("lp_v", `${testId}_${variantId}`);
      }
      initNectar();
    }
  }, 100);

  // Fallback timeout
  setTimeout(() => {
    clearInterval(checkOptibase);
    // Only call initNectar if Optibase hasn't initialized yet
    if (!(window.optibaseScriptLoaded && window.optibaseInitialized) && !window.nectarInitialized && !nectarInitiationStarted) {
      sessionStorage.setItem("lp_v", 'variant_missing');
      initNectar();
    }
  }, TIMEOUT_MS);