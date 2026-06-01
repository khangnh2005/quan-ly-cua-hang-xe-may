import { legacy_createStore as createStore } from 'redux';
import allReducers from '../reducers';

const store = createStore(allReducers);

export default store;