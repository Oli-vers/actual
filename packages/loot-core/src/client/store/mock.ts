// This is temporary until we move all loot-core/client over to desktop-client.
/* eslint-disable */
import {
  name as accountsSliceName,
  reducer as accountsSliceReducer,
} from '@actual-app/web/src/accounts/accountsSlice';
import {
  name as appSliceName,
  reducer as appSliceReducer,
} from '@actual-app/web/src/app/appSlice';

import {
  name as budgetsSliceName,
  reducer as budgetsSliceReducer,
} from '@actual-app/web/src/budgets/budgetsSlice';
/* eslint-enable */
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import {
  name as modalsSliceName,
  reducer as modalsSliceReducer,
} from '../modals/modalsSlice';
import {
  name as notificationsSliceName,
  reducer as notificationsSliceReducer,
} from '../notifications/notificationsSlice';
import {
  name as prefsSliceName,
  reducer as prefsSliceReducer,
} from '../prefs/prefsSlice';
import {
  name as queriesSliceName,
  reducer as queriesSliceReducer,
} from '../queries/queriesSlice';
import {
  name as usersSliceName,
  reducer as usersSliceReducer,
} from '../users/usersSlice';

import { type store as realStore } from './index';

const appReducer = combineReducers({
  [accountsSliceName]: accountsSliceReducer,
  [appSliceName]: appSliceReducer,
  [budgetsSliceName]: budgetsSliceReducer,
  [modalsSliceName]: modalsSliceReducer,
  [notificationsSliceName]: notificationsSliceReducer,
  [prefsSliceName]: prefsSliceReducer,
  [queriesSliceName]: queriesSliceReducer,
  [usersSliceName]: usersSliceReducer,
});

export let mockStore: typeof realStore = configureStore({
  reducer: appReducer,
});

export function resetMockStore() {
  mockStore = configureStore({
    reducer: appReducer,
  });
}
