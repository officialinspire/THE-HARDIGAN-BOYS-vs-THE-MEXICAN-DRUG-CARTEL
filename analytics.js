/* Optional, non-blocking analytics. No network dependency is awaited by the game. */
(() => {
    'use strict';
    const params = new URLSearchParams(location.search);
    const testing = params.get('debug') === 'true' || params.get('noSave') === '1' ||
        ['localhost', '127.0.0.1', ''].includes(location.hostname) || navigator.webdriver;
    const disabled = params.get('analytics') === 'off' ||
        navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
    const enabled = !disabled && (!testing || params.get('analytics_test') === '1');
    let client;
    let queue = [];
    let sequence = 0;
    const attribution = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source', 'placement']) {
        const value = params.get(key);
        if (value && /^[a-zA-Z0-9_ .-]{1,100}$/.test(value)) attribution[key] = value;
    }
    const common = {
        game: 'hardigan_boys', game_version: '2026.11.14', brand: 'INSPIRE',
        mode: 'story', ...attribution, is_test: testing,
        $current_url: location.origin + location.pathname,
        $pathname: location.pathname, $referrer: '', $referring_domain: '',
        $geoip_disable: true,
    };
    function send(entry) {
        try { client.capture(entry.event, entry.properties); } catch (_) {}
    }
    window.HBAnalytics = {
        capture(event, properties = {}) {
            if (!enabled) return;
            const entry = { event, properties: { ...common, ...properties, event_sequence: ++sequence } };
            if (client) send(entry);
            else if (queue.length < 100) queue.push(entry);
        }
    };
    if (!enabled) return;
    let stopped = false;
    const watchdog = setTimeout(() => { stopped = true; queue = []; }, 10000);
    fetch('./analytics-config.json?v=20261114').then(r => r.ok ? r.json() : null).then(config => {
        if (!config?.POSTHOG_PROJECT_TOKEN || !config?.POSTHOG_HOST || stopped) return;
        const script = document.createElement('script');
        script.src = './vendor/posthog.js?v=20261114';
        script.async = true;
        script.onerror = () => { stopped = true; queue = []; clearTimeout(watchdog); };
        script.onload = () => {
            if (stopped) return;
            try {
                window.posthog.init(config.POSTHOG_PROJECT_TOKEN, {
                    api_host: config.POSTHOG_HOST, defaults: '2026-08-30',
                    autocapture: false, capture_pageview: false, capture_pageleave: false,
                    disable_session_recording: true, capture_exceptions: false,
                    capture_performance: false, capture_dead_clicks: false,
                    enable_heatmaps: false, disable_surveys: true,
                    advanced_disable_feature_flags: true,
                    person_profiles: 'never', persistence: 'localStorage',
                    save_referrer: false, store_google: false, respect_dnt: true,
                    loaded(ph) {
                        if (stopped) return;
                        client = ph;
                        clearTimeout(watchdog);
                        ph.register(common);
                        ph.capture('$pageview', common);
                        queue.splice(0).forEach(send);
                    }
                });
            } catch (_) { stopped = true; queue = []; clearTimeout(watchdog); }
        };
        document.head.appendChild(script);
    }).catch(() => { stopped = true; queue = []; clearTimeout(watchdog); });
})();
