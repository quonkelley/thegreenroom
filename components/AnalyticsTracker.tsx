import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  event: string;
  data?: Record<string, any>;
  page?: string;
}

export const trackEvent = (event: string, data?: Record<string, any>) => {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        ...data,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      }),
    }).catch(console.error);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({
  event,
  data,
  page,
}) => {
  useEffect(() => {
    trackEvent(event, {
      ...data,
      page: page || window.location.pathname,
    });
  }, [event, data, page]);

  return null;
};

// Common analytics events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  PITCH_GENERATED: 'pitch_generated',
  EMAIL_SENT: 'email_sent',
  CAMPAIGN_CREATED: 'campaign_created',
  PROFILE_UPDATED: 'profile_updated',
  GOAL_COMPLETED: 'goal_completed',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred',
} as const;

// Utility functions for common tracking scenarios
export const trackPageView = (page: string, data?: Record<string, any>) => {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page, ...data });
};

export const trackButtonClick = (
  buttonName: string,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, { button: buttonName, ...data });
};

export const trackFormSubmit = (
  formName: string,
  success: boolean,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
    form: formName,
    success,
    ...data,
  });
};

export const trackPitchGenerated = (
  venueName: string,
  genre: string,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.PITCH_GENERATED, {
    venue: venueName,
    genre,
    ...data,
  });
};

export const trackEmailSent = (
  campaignId: string,
  venueName: string,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
    campaign: campaignId,
    venue: venueName,
    ...data,
  });
};

export const trackGoalCompleted = (
  goalType: string,
  goalValue: number,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.GOAL_COMPLETED, {
    goal: goalType,
    value: goalValue,
    ...data,
  });
};

export const trackFeatureUsed = (
  featureName: string,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.FEATURE_USED, { feature: featureName, ...data });
};

export const trackError = (
  errorType: string,
  errorMessage: string,
  data?: Record<string, any>
) => {
  trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    type: errorType,
    message: errorMessage,
    ...data,
  });
};
