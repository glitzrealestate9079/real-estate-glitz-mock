import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slices/uiSlice";
import notificationsReducer from "./slices/notificationsSlice";
import messagesReducer from "./slices/messagesSlice";
import dashboardReducer from "./slices/dashboardSlice";
import listingsReducer from "./slices/listingsSlice";
import usersReducer from "./slices/usersSlice";
import leadsReducer from "./slices/leadsSlice";
import paymentsReducer from "./slices/paymentsSlice";
import buildersReducer from "./slices/buildersSlice";
import reviewsReducer from "./slices/reviewsSlice";
import cmsReducer from "./slices/cmsSlice";
import settingsReducer from "./slices/settingsSlice";
import townshipReducer from "./slices/townshipSlice";
import reportsReducer from "./slices/reportsSlice";
import authReducer from "./slices/authSlice";
import siteVisitsReducer from "./slices/siteVisitsSlice";
import locationsReducer from "./slices/locationsSlice";
import agentsReducer from "./slices/agentsSlice";
import savedSearchesReducer from "./slices/savedSearchesSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    dashboard: dashboardReducer,
    listings: listingsReducer,
    users: usersReducer,
    leads: leadsReducer,
    payments: paymentsReducer,
    builders: buildersReducer,
    reviews: reviewsReducer,
    cms: cmsReducer,
    settings: settingsReducer,
    township: townshipReducer,
    reports: reportsReducer,
    auth: authReducer,
    siteVisits: siteVisitsReducer,
    locations: locationsReducer,
    agents: agentsReducer,
    savedSearches: savedSearchesReducer,
  },
});
